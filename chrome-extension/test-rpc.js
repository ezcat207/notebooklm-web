/**
 * RPC Integration Tests
 *
 * Run this in Chrome Extension context to verify ALL RPC calls work correctly.
 * Tests against the Python CLI reference implementation.
 *
 * Usage:
 * 1. Open Chrome Extension service worker console
 * 2. Run: testAllRPC()
 * 3. Review results - all should PASS
 */

// Test configuration
const TEST_CONFIG = {
  // Use existing test notebook or create new one
  testNotebookId: '64ed8fbe-3879-43cf-ae06-635e571dbd12', // TEST-WebUI-Audit-174843
  testUrls: [
    'https://en.wikipedia.org/wiki/Artificial_intelligence',
    'https://en.wikipedia.org/wiki/Machine_learning'
  ],
  cleanup: false // Set to true to delete test artifacts
};

// Test results tracker
const testResults = {
  passed: [],
  failed: [],
  skipped: []
};

function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${name}: ${status}${details ? ' - ' + details : ''}`);

  if (status === 'PASS') testResults.passed.push(name);
  else if (status === 'FAIL') testResults.failed.push({ name, details });
  else testResults.skipped.push({ name, details });
}

/**
 * Test 1: LIST_NOTEBOOKS (wXbhsf)
 * Python CLI: notebooks.py:40
 * Format: [null, 1, null, [2]]
 * Returns: result[0] = notebook list
 */
async function testListNotebooks() {
  try {
    const result = await callRPC('wXbhsf', [null, 1, null, [2]]);

    // Verify result structure
    if (!Array.isArray(result)) throw new Error('Result is not an array');
    if (!Array.isArray(result[0])) throw new Error('result[0] is not an array');

    const notebooks = result[0];
    logTest('LIST_NOTEBOOKS', 'PASS', `Found ${notebooks.length} notebooks`);
    return true;
  } catch (error) {
    logTest('LIST_NOTEBOOKS', 'FAIL', error.message);
    return false;
  }
}

/**
 * Test 2: GET_NOTEBOOK (rLM1Ne)
 * Python CLI: notebooks.py:128-134
 * Format: [notebook_id, null, [2], null, 0]
 * Returns: result[0] = notebook_data, notebook_data[0] = title, notebook_data[1] = sources
 */
async function testGetNotebook() {
  try {
    const result = await callRPC('rLM1Ne', [TEST_CONFIG.testNotebookId, null, [2], null, 0]);

    // Verify result structure (from Python CLI sources.py:281-310)
    if (!Array.isArray(result)) throw new Error('Result is not an array');
    if (!Array.isArray(result[0])) throw new Error('result[0] is not an array (should be notebook_data)');

    const notebookData = result[0];
    const title = notebookData[0];
    const sources = notebookData[1];

    if (typeof title !== 'string') throw new Error('Title is not a string');
    if (!Array.isArray(sources)) throw new Error('Sources is not an array');

    logTest('GET_NOTEBOOK', 'PASS', `Title: "${title}", Sources: ${sources.length}`);
    return { title, sources };
  } catch (error) {
    logTest('GET_NOTEBOOK', 'FAIL', error.message);
    return null;
  }
}

/**
 * Test 3: CREATE_NOTEBOOK (CCqFvf)
 * Python CLI: notebooks.py:170-176
 * Format: [title, null, null, [2], [1, null, null, null, null, null, null, null, null, null, [1]]]
 * Returns: result[2] = notebook_id (NOT result[0]!)
 */
async function testCreateNotebook() {
  try {
    const testTitle = `RPC-Test-${Date.now()}`;
    const result = await callRPC('CCqFvf', [
      testTitle, null, null, [2],
      [1, null, null, null, null, null, null, null, null, null, [1]]
    ]);

    // Verify result structure
    if (!Array.isArray(result)) throw new Error('Result is not an array');
    if (result.length < 3) throw new Error('Result array too short');

    const notebookId = result[2]; // notebook_id at index 2!
    if (typeof notebookId !== 'string') throw new Error('Notebook ID is not a string');

    logTest('CREATE_NOTEBOOK', 'PASS', `Created: ${notebookId}`);
    return notebookId;
  } catch (error) {
    logTest('CREATE_NOTEBOOK', 'FAIL', error.message);
    return null;
  }
}

/**
 * Test 4: RENAME_NOTEBOOK (s0tc2d)
 * Python CLI: notebooks.py:191-192
 * Format: [notebook_id, [[null, null, null, [null, new_title]]]]
 * Returns: result !== null = success
 */
async function testRenameNotebook(notebookId) {
  try {
    const newTitle = `Renamed-${Date.now()}`;
    const result = await callRPC('s0tc2d', [
      notebookId,
      [[null, null, null, [null, newTitle]]]
    ]);

    if (result === null) throw new Error('Result is null');

    logTest('RENAME_NOTEBOOK', 'PASS', `Renamed to: "${newTitle}"`);
    return true;
  } catch (error) {
    logTest('RENAME_NOTEBOOK', 'FAIL', error.message);
    return false;
  }
}

/**
 * Test 5: DELETE_NOTEBOOK (WWINqb)
 * Python CLI: notebooks.py:237-238
 * Format: [[notebook_id], [2]]
 * Returns: result !== null = success
 */
async function testDeleteNotebook(notebookId) {
  try {
    const result = await callRPC('WWINqb', [[notebookId], [2]]);

    if (result === null) throw new Error('Result is null');

    logTest('DELETE_NOTEBOOK', 'PASS', `Deleted: ${notebookId}`);
    return true;
  } catch (error) {
    logTest('DELETE_NOTEBOOK', 'FAIL', error.message);
    return false;
  }
}

/**
 * Test 6: GET_SUMMARY (VfAZjd)
 * Python CLI: notebooks.py:136-166
 * Format: [notebook_id, [2]]
 * Returns: result[0][0] = summary, result[1][0] = suggested_topics
 */
async function testGetSummary() {
  try {
    const result = await callRPC('VfAZjd', [TEST_CONFIG.testNotebookId, [2]]);

    if (!Array.isArray(result)) throw new Error('Result is not an array');
    if (!Array.isArray(result[0])) throw new Error('result[0] is not an array');

    const summary = result[0][0];
    const suggestedTopics = Array.isArray(result[1]) ? result[1][0] : null;

    if (typeof summary !== 'string') throw new Error('Summary is not a string');

    logTest('GET_SUMMARY', 'PASS', `Summary length: ${summary.length} chars`);
    return { summary, suggestedTopics };
  } catch (error) {
    logTest('GET_SUMMARY', 'FAIL', error.message);
    return null;
  }
}

/**
 * Test 7: DELETE_SOURCE (tGMBJ)
 * Python CLI: sources.py:252-254
 * Format: [[[source_id]], [2]]
 * Returns: result !== null = success
 */
async function testDeleteSource(sourceId) {
  try {
    const result = await callRPC('tGMBJ', [[[sourceId]], [2]]);

    if (result === null) throw new Error('Result is null');

    logTest('DELETE_SOURCE', 'PASS', `Deleted: ${sourceId}`);
    return true;
  } catch (error) {
    logTest('DELETE_SOURCE', 'FAIL', error.message);
    return false;
  }
}

/**
 * Test 8: CREATE_STUDIO - Audio (R7cb6c)
 * Python CLI: studio.py:197-201
 * Format: [[2], notebook_id, content]
 * Content: [null, null, 1, sources_nested, null, null, [null, [focus, length, null, sources_simple, language, null, format]]]
 * Returns: result[0] = artifact_id
 */
async function testCreateStudioAudio(notebookData) {
  try {
    const { sources } = notebookData;

    // Extract source IDs correctly (Python CLI sources.py:281-310)
    const sourceIds = sources.map(s => {
      if (Array.isArray(s[0]) && s[0].length > 0) return s[0][0];
      return s[2];
    }).filter(Boolean);

    if (sourceIds.length === 0) throw new Error('No sources found');

    // Build content array matching Python CLI studio.py:197-201
    const sourcesNested = sourceIds.map(id => [[id]]);
    const sourcesSimple = sourceIds.map(id => [id]);

    const content = [
      null, null, 1, sourcesNested, null, null,
      [null, [null, 2, null, sourcesSimple, 'en', null, 2]] // format=2 (Deep Dive), length=2 (Default)
    ];

    const result = await callRPC('R7cb6c', [[2], TEST_CONFIG.testNotebookId, content]);

    if (!Array.isArray(result)) throw new Error('Result is not an array');

    const artifactId = result[0];
    if (typeof artifactId !== 'string') throw new Error('Artifact ID is not a string');

    logTest('CREATE_STUDIO_AUDIO', 'PASS', `Created: ${artifactId}`);
    return artifactId;
  } catch (error) {
    logTest('CREATE_STUDIO_AUDIO', 'FAIL', error.message);
    return null;
  }
}

/**
 * Test 9: CREATE_STUDIO - Infographic (R7cb6c)
 * Python CLI: studio.py:859-884
 * Format: [[2], notebook_id, content]
 * Content: [null, null, 7, sources_nested, null x10, [[focus, language, null, orientation, detail, style]]]
 * Returns: result[0] = artifact_id
 */
async function testCreateStudioInfographic(notebookData) {
  try {
    const { sources } = notebookData;

    const sourceIds = sources.map(s => {
      if (Array.isArray(s[0]) && s[0].length > 0) return s[0][0];
      return s[2];
    }).filter(Boolean);

    if (sourceIds.length === 0) throw new Error('No sources found');

    const sourcesNested = sourceIds.map(id => [[id]]);

    // 15 elements total, options at position 14
    const content = [
      null, null, 7, sourcesNested,
      null, null, null, null, null, null, null, null, null, null,
      [[null, 'en', null, 1, 2, 3]] // orientation=1 (Landscape), detail=2 (Standard), style=3 (Professional)
    ];

    const result = await callRPC('R7cb6c', [[2], TEST_CONFIG.testNotebookId, content]);

    if (!Array.isArray(result)) throw new Error('Result is not an array');

    const artifactId = result[0];
    if (typeof artifactId !== 'string') throw new Error('Artifact ID is not a string');

    logTest('CREATE_STUDIO_INFOGRAPHIC', 'PASS', `Created: ${artifactId}`);
    return artifactId;
  } catch (error) {
    logTest('CREATE_STUDIO_INFOGRAPHIC', 'FAIL', error.message);
    return null;
  }
}

/**
 * Test 10: POLL_STUDIO (gArtLc)
 * Python CLI: studio.py:307-327
 * Format: [[2], notebook_id, 'NOT artifact.status = "ARTIFACT_STATUS_SUGGESTED"']
 * Returns: result[0] = artifact list, each: [artifact_id, title, type_code, status, ...]
 */
async function testPollStudio() {
  try {
    const result = await callRPC('gArtLc', [
      [2],
      TEST_CONFIG.testNotebookId,
      'NOT artifact.status = "ARTIFACT_STATUS_SUGGESTED"'
    ]);

    if (!Array.isArray(result)) throw new Error('Result is not an array');

    const artifactList = Array.isArray(result[0]) ? result[0] : result;
    if (!Array.isArray(artifactList)) throw new Error('Artifact list is not an array');

    logTest('POLL_STUDIO', 'PASS', `Found ${artifactList.length} artifacts`);
    return artifactList;
  } catch (error) {
    logTest('POLL_STUDIO', 'FAIL', error.message);
    return null;
  }
}

/**
 * Helper: Call RPC with proper error handling
 */
async function callRPC(rpcName, params) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'RPC_CALL',
        data: { rpcName, params }
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response.success) {
          reject(new Error(response.error || 'Unknown error'));
        } else {
          resolve(response.data);
        }
      }
    );
  });
}

/**
 * Main test suite
 */
async function testAllRPC() {
  console.log('🧪 Starting RPC Integration Tests...\n');
  console.log(`📝 Test Notebook: ${TEST_CONFIG.testNotebookId}\n`);

  testResults.passed = [];
  testResults.failed = [];
  testResults.skipped = [];

  let testNotebookId = null;
  let createdArtifacts = [];

  try {
    // Phase 1: Basic Notebook Operations
    console.log('\n📁 Phase 1: Basic Notebook Operations\n');

    await testListNotebooks();
    const notebookData = await testGetNotebook();

    if (!notebookData) {
      console.log('\n❌ Cannot continue without valid notebook data');
      return printResults();
    }

    // Phase 2: Notebook Mutations (using temporary notebook)
    console.log('\n✏️  Phase 2: Notebook Mutations\n');

    testNotebookId = await testCreateNotebook();
    if (testNotebookId) {
      await testRenameNotebook(testNotebookId);
    }

    // Phase 3: Summary
    console.log('\n📄 Phase 3: Summary\n');

    await testGetSummary();

    // Phase 4: Studio Operations
    console.log('\n🎨 Phase 4: Studio Operations\n');

    const audioId = await testCreateStudioAudio(notebookData);
    if (audioId) createdArtifacts.push(audioId);

    const infographicId = await testCreateStudioInfographic(notebookData);
    if (infographicId) createdArtifacts.push(infographicId);

    const artifacts = await testPollStudio();

    // Phase 5: Cleanup (optional)
    if (TEST_CONFIG.cleanup) {
      console.log('\n🧹 Phase 5: Cleanup\n');

      if (testNotebookId) {
        await testDeleteNotebook(testNotebookId);
      }
    }

  } catch (error) {
    console.error('\n💥 Test suite crashed:', error);
  }

  // Print results
  printResults();
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ PASSED: ${testResults.passed.length}`);
  console.log(`❌ FAILED: ${testResults.failed.length}`);
  console.log(`⚠️  SKIPPED: ${testResults.skipped.length}`);

  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(({ name, details }) => {
      console.log(`  - ${name}: ${details}`);
    });
  }

  if (testResults.passed.length === testResults.passed.length + testResults.failed.length + testResults.skipped.length
      && testResults.failed.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - Review errors above');
  }

  console.log('='.repeat(60) + '\n');
}

// Export for console usage (works in both browser and Service Worker)
// Use globalThis which works everywhere
if (typeof globalThis !== 'undefined') {
  globalThis.testAllRPC = testAllRPC;
  globalThis.TEST_CONFIG = TEST_CONFIG;
  globalThis.testGetNotebook = testGetNotebook;
  globalThis.testCreateStudioAudio = testCreateStudioAudio;
  globalThis.testPollStudio = testPollStudio;
  console.log('✅ RPC Tests loaded. Run: testAllRPC()');
}

// Also attach to self for Service Worker compatibility
if (typeof self !== 'undefined') {
  self.testAllRPC = testAllRPC;
  self.TEST_CONFIG = TEST_CONFIG;
}
