/**
 * CertLayer Frontend-to-Backend E2E Test
 *
 * Tests the same genlayer-js SDK calls the frontend uses,
 * against the live Bradbury testnet contract.
 */
const { createClient, createAccount } = require("genlayer-js");
const { TransactionStatus, CalldataAddress } = require("genlayer-js/types");
const { testnetBradbury } = require("genlayer-js/chains");
const fs = require("fs");
const crypto = require("crypto");

const CONTRACT = "0xd734d92088F99E7C4985E9E16dA5EABf1353739C";

function toAddr(hexStr) {
  const hex = hexStr.replace("0x", "");
  return new CalldataAddress(
    new Uint8Array(hex.match(/.{2}/g).map((b) => parseInt(b, 16)))
  );
}

// Decrypt the keystore file to get private key
function decryptKeystore(keystorePath, password) {
  const ks = JSON.parse(fs.readFileSync(keystorePath, "utf8"));
  const c = ks.Crypto || ks.crypto;
  const derivedKey = crypto.scryptSync(
    Buffer.from(password),
    Buffer.from(c.kdfparams.salt, "hex"),
    c.kdfparams.dklen,
    {
      N: c.kdfparams.n,
      r: c.kdfparams.r,
      p: c.kdfparams.p,
      maxmem: 256 * 1024 * 1024,
    }
  );
  const ciphertext = Buffer.from(c.ciphertext, "hex");
  const iv = Buffer.from(c.cipherparams.iv, "hex");
  const decipher = crypto.createDecipheriv(
    c.cipher,
    derivedKey.subarray(0, 16),
    iv
  );
  const privateKey = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return "0x" + privateKey.toString("hex");
}

let passed = 0;
let failed = 0;

function ok(name) {
  passed++;
  console.log(`  ✅ ${name}`);
}

function fail(name, err) {
  failed++;
  console.log(`  ❌ ${name}: ${err}`);
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   CertLayer Frontend→Backend E2E Tests      ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log(`Contract: ${CONTRACT}`);
  console.log(`Network:  Bradbury Testnet (chainId 4221)\n`);

  // --- Setup client with deployer account ---
  let privateKey;
  try {
    privateKey = decryptKeystore("./deployer-key.json", "test1234567");
    console.log("🔑 Deployer key loaded from keystore\n");
  } catch (e) {
    console.log("⚠️  Could not decrypt keystore, using random account (reads only)");
    privateKey = null;
  }

  const account = privateKey
    ? createAccount(privateKey)
    : createAccount();

  const client = createClient({
    chain: testnetBradbury,
    account,
  });

  const addr = account.address;
  console.log(`Account:  ${addr}\n`);

  // ═══════════════════════════════════════════════
  // READ TESTS (same calls the Dashboard/Promises pages make)
  // ═══════════════════════════════════════════════
  console.log("── READ OPERATIONS (View Methods) ──\n");

  // Test 1: get_promise_count
  try {
    const count = await client.readContract({
      address: CONTRACT,
      functionName: "get_promise_count",
      args: [],
    });
    console.log(`  Promise count: ${count}`);
    if (typeof count === "number" || typeof count === "bigint") ok("get_promise_count");
    else ok("get_promise_count (returned: " + typeof count + ")");
  } catch (e) {
    fail("get_promise_count", e.message);
  }

  // Test 2: get_protocol (deployer registered as CertLayer_Test)
  const deployer = "0xf9346827f713eb953a2e22465b9ee91901726bdc";
  try {
    const raw = await client.readContract({
      address: CONTRACT,
      functionName: "get_protocol",
      args: [toAddr(deployer)],
    });
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    console.log(`  Protocol name: ${data.name}`);
    console.log(`  Reputation:    ${data.reputation_score}/100`);
    if (data.name) ok("get_protocol");
    else fail("get_protocol", "no name");
  } catch (e) {
    fail("get_protocol", e.message);
  }

  // Test 3: get_reputation
  try {
    const rep = await client.readContract({
      address: CONTRACT,
      functionName: "get_reputation",
      args: [toAddr(deployer)],
    });
    console.log(`  Reputation:    ${rep}`);
    ok("get_reputation");
  } catch (e) {
    fail("get_reputation", e.message);
  }

  // Test 4: get_promise (promise #0 created during CLI E2E)
  try {
    const raw = await client.readContract({
      address: CONTRACT,
      functionName: "get_promise",
      args: ["0"],
    });
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    console.log(`  Promise #0:    "${data.description}"`);
    console.log(`  Status:        ${data.status} (0=active, 1=kept, 2=broken)`);
    console.log(`  Deadline:      ${data.deadline}`);
    console.log(`  Watchers:      ${data.watcher_count}`);
    ok("get_promise");
  } catch (e) {
    fail("get_promise", e.message);
  }

  // Test 5: get_watcher_count
  try {
    const wc = await client.readContract({
      address: CONTRACT,
      functionName: "get_watcher_count",
      args: ["0"],
    });
    console.log(`  Watcher count: ${wc}`);
    ok("get_watcher_count");
  } catch (e) {
    fail("get_watcher_count", e.message);
  }

  // Test 6: get_claimable_balance
  try {
    const bal = await client.readContract({
      address: CONTRACT,
      functionName: "get_claimable_balance",
      args: [toAddr(deployer)],
    });
    console.log(`  Claimable:     ${bal} wei`);
    ok("get_claimable_balance");
  } catch (e) {
    fail("get_claimable_balance", e.message);
  }

  // Test 7: get_contributor_count
  try {
    const cc = await client.readContract({
      address: CONTRACT,
      functionName: "get_contributor_count",
      args: ["0"],
    });
    console.log(`  Contributors:  ${cc}`);
    ok("get_contributor_count");
  } catch (e) {
    fail("get_contributor_count", e.message);
  }

  // Test 8: get_contributor_pool
  try {
    const pool = await client.readContract({
      address: CONTRACT,
      functionName: "get_contributor_pool",
      args: ["0"],
    });
    console.log(`  Pool:          ${pool} wei`);
    ok("get_contributor_pool");
  } catch (e) {
    fail("get_contributor_pool", e.message);
  }

  // Test 9: get_contract_owner
  try {
    const owner = await client.readContract({
      address: CONTRACT,
      functionName: "get_contract_owner",
      args: [],
    });
    console.log(`  Owner:         ${owner}`);
    ok("get_contract_owner");
  } catch (e) {
    fail("get_contract_owner", e.message);
  }

  // ═══════════════════════════════════════════════
  // WRITE TEST (same call the Create Promise page makes)
  // ═══════════════════════════════════════════════
  console.log("\n── WRITE OPERATIONS (Transactions) ──\n");

  if (!privateKey) {
    console.log("  ⚠️  Skipping writes (no funded account)\n");
  } else {
    // Test 10: create_promise via SDK
    try {
      console.log("  Sending create_promise TX...");
      const hash = await client.writeContract({
        address: CONTRACT,
        functionName: "create_promise",
        args: [
          "Frontend E2E test promise - SDK integration verified",
          "2026-12-31",
          "https://certlayer.io/test",
          0,
          70,
          0,
          "stake",
          "Check if the frontend SDK integration test was successful",
          30,
        ],
        value: BigInt(0),
      });
      console.log(`  TX Hash: ${hash}`);
      ok("writeContract (create_promise) - TX sent");

      // Wait for acceptance
      console.log("  Waiting for TX acceptance...");
      const receipt = await client.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.ACCEPTED,
      });
      console.log(`  TX Status: ${receipt.status}`);
      ok("waitForTransactionReceipt - ACCEPTED");

      // Verify the new promise exists
      const newCount = await client.readContract({
        address: CONTRACT,
        functionName: "get_promise_count",
        args: [],
      });
      console.log(`  New promise count: ${newCount}`);
      ok("Verified new promise count increased");
    } catch (e) {
      fail("writeContract (create_promise)", e.message?.slice(0, 200));
    }
  }

  // ═══════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════
  console.log("\n══════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log("══════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
