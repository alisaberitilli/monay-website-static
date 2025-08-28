// https://github.com/andsmedeiros/hw-fingerprint
import { createHash } from "node:crypto";
import { EOL, endianness } from "node:os";
import {
  baseboard,
  bios,
  blockDevices,
  cpu,
  mem,
  osInfo,
  system,
} from "systeminformation";

/**
 * Available system parameters for fingerprint calculation.
 */
async function asyncGetFingerprintingInfo() {
  const [
    { manufacturer, model, serial, uuid },
    { vendor, version: biosVersion, releaseDate },
    { manufacturer: boardManufacturer, model: boardModel, serial: boardSerial },
    {
      manufacturer: cpuManufacturer,
      brand,
      speedMax,
      cores,
      physicalCores,
      socket,
    },
    { total: memTotal },
    { platform, arch },
    devices,
  ] = await Promise.all([
    system(),
    bios(),
    baseboard(),
    cpu(),
    mem(),
    osInfo(),
    blockDevices(),
  ]);

  const hdds = devices
    .filter(({ type, removable }) => type === "disk" && !removable)
    .map(({ model, serial }) => model + serial);

  return {
    EOL,
    endianness: endianness(),
    manufacturer,
    model,
    serial,
    uuid,
    vendor,
    biosVersion,
    releaseDate,
    boardManufacturer,
    boardModel,
    boardSerial,
    cpuManufacturer,
    brand,
    speedMax: speedMax.toFixed(2),
    cores,
    physicalCores,
    socket,
    memTotal,
    platform,
    arch,
    hdds,
  };
}

let fingerprintingInfo: Awaited<
  ReturnType<typeof asyncGetFingerprintingInfo>
> | null = null;

asyncGetFingerprintingInfo().then((info) => {
  fingerprintingInfo = info;
});

/**
 * Calculates the fingerprint for given system parameters, ordered as 'FINGERPRINTING_INFO` properties
 * @param {string[]} parameters System parameters to use for fingerprinting calculation
 * @returns {Buffer} The 512-bit fingerprint as a `Buffer`
 */
function calculateFingerprint(parameters) {
  if (fingerprintingInfo) {
    const fingerprintString = parameters
      .map((param) => fingerprintingInfo?.[param])
      .join("");
    const fingerprintHash = createHash("sha512").update(fingerprintString);
    return fingerprintHash.digest();
  }
  return null;
}

const cachedFingerprints = {};

/**
 * Calculates the 512-bit fingerprint using this system's parameters.
 * Additional customisation of which parameters are accounted for are available through the `options` parameter.
 * @param {object} options An object that controls which system parameters should be used for fingerprint calculation
 * @param {string[]} options.only An inclusive property list; if provided, only properties listed here are used for calculation
 * @param {string[]} options.except An exclusive property list; if provided, all available properties not listed here are used for calculation
 * @returns {Buffer} The 512-bit fingerprint as a `Buffer`
 */
export function getFingerprint({
  only = Object.keys(fingerprintingInfo ?? {}),
  except = [],
}: { only?: string[]; except?: string[] } = {}) {
  const parameters = Object.keys(fingerprintingInfo ?? {}).filter(
    (key) => only.includes(key) && !except.includes(key)
  );
  const cacheKey = parameters.join("");
  if (!cachedFingerprints[cacheKey]) {
    cachedFingerprints[cacheKey] = calculateFingerprint(parameters);
  }
  return cachedFingerprints[cacheKey];
}

/**
 * Gets the available system parameters to be used in fingerprinting calculation.
 * This parameters can be used in conjuction with the `getFingerprint()` function to customise fingerprint generation.
 * @returns An object containing all the available fingerprinting parameters
 */
export function getFingerprintingInfo() {
  return fingerprintingInfo;
}
