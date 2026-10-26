#!/usr/bin/env bash
# Make a REAL in-place Android update using the existing install's signing key.
# NEVER generates a new keystore or publishes mismatched certificates.
set -euo pipefail
usage() {
  cat >&2 <<'USAGE'
Usage: bash scripts/sign-android-update.sh UNSIGNED_RELEASE.apk EXISTING_KEYSTORE.p12 CURRENT_INSTALLED.apk [OUTPUT.apk]

The reference APK must be signed with the same certificate as the current
installation. apksigner prompts for your password securely.
USAGE
}
if [[ $# -lt 3 || $# -gt 4 ]]; then usage; exit 2; fi
unsigned=$1
keystore=$2
reference=$3
output=ButtonGame-signed-update.apk
if [[ $# -eq 4 ]]; then output=$4; fi
for file in "$unsigned" "$keystore" "$reference"; do
  if [[ ! -s "$file" ]]; then
    printf 'Missing or empty file: %s\n' "$file" >&2
    exit 2
  fi
done
if [[ "$output" == "$unsigned" || "$output" == "$reference" || "$output" == "$keystore" || -e "$output" ]]; then
  echo 'Output must be a new path, different from the input files.' >&2
  exit 2
fi
for command in apksigner zipalign aapt; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing Android SDK Build Tools executable: $command" >&2
    exit 2
  fi
done
get_fingerprint() {
  local details
  details=$(apksigner verify --print-certs "$1") || return 1
  printf '%s\n' "$details" | sed -n 's/^Signer #1 certificate SHA-256 digest: //p' | head -n 1 | tr '[:upper:]' '[:lower:]'
}
reference_fingerprint=$(get_fingerprint "$reference") || {
  echo 'Reference APK signature verification failed.' >&2
  exit 2
}
if [[ ! "$reference_fingerprint" =~ ^[0-9a-f]{64}$ ]]; then
  echo 'Could not obtain a SHA-256 fingerprint from reference APK.' >&2
  exit 2
fi
apk_identity() {
  aapt dump badging "$1" | awk -F "'" '/^package: / {print $2, $4; exit}'
}
read -r old_package old_version <<< "$(apk_identity "$reference")"
read -r new_package new_version <<< "$(apk_identity "$unsigned")"
if [[ "$old_package" != 'com.babunigaming.buttongame' || "$new_package" != "$old_package" ]]; then
  echo 'Package mismatch; refusing to sign a different application.' >&2
  exit 2
fi
if [[ ! "$old_version" =~ ^[0-9]+$ || ! "$new_version" =~ ^[0-9]+$ || $new_version -le $old_version ]]; then
  echo "An update must have a higher versionCode than installed ($old_version -> $new_version)." >&2
  exit 2
fi
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
umask 077
zipalign -f -p 4 "$unsigned" "$work/aligned.apk"
echo 'Signing with your existing private key. Enter password at the secure prompt.'
apksigner sign --ks "$keystore" --ks-type PKCS12 --out "$work/signed.apk" "$work/aligned.apk"
new_fingerprint=$(get_fingerprint "$work/signed.apk") || {
  echo 'New APK signature verification failed.' >&2
  exit 1
}
if [[ "$new_fingerprint" != "$reference_fingerprint" ]]; then
  echo 'SIGNATURE MISMATCH: this APK could not update the installed game.' >&2
  echo "Installed signer: $reference_fingerprint" >&2
  echo "New signer:       $new_fingerprint" >&2
  echo 'No update was published. Locate the private key from the installed build.' >&2
  exit 1
fi
cp "$work/signed.apk" "$output"
printf 'Verified compatible update! versionCode %s -> %s\nFile: %s\n' "$old_version" "$new_version" "$output"
