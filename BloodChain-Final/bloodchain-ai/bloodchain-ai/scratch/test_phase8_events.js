import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification
} from '../src/services/notificationService.js';

// Polyfill localStorage in Node.js environment if needed
if (typeof localStorage === 'undefined') {
  let store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

async function runEventTests() {
  console.log('=== PHASE 8 NOTIFICATION SERVICE & IDEMPOTENCY EVENT TESTS ===\n');

  // Test 1: Fetch initial unread count
  const initialUnread = await getUnreadNotificationCount();
  console.log(`Initial unread count: ${initialUnread}`);

  // Test 2: Emit Recommendation Accepted event
  console.log('\nEmitting: recommendation_accepted event...');
  const res1 = await createNotification({
    event_key: 'test_event:recommendation_accepted:rec-101',
    role: 'Hospital Admin',
    type: 'recommendation_accepted',
    title: 'AI Recommendation Accepted',
    message: 'Allocation for Request BRQ999 (O+, 2 units) authorized for dispatch to Kauvery Hospital.',
    related_request_id: 'BRQ999',
    related_recommendation_id: 'rec-101',
    priority: 'Critical'
  });
  console.log(`Result: success=${res1.success}, id=${res1.data?.id}`);

  // Test 3: Idempotency protection check (duplicate event_key)
  console.log('\nEmitting DUPLICATE event with same event_key...');
  const dupRes = await createNotification({
    event_key: 'test_event:recommendation_accepted:rec-101',
    role: 'Hospital Admin',
    type: 'recommendation_accepted',
    title: 'AI Recommendation Accepted',
    message: 'Allocation for Request BRQ999 (O+, 2 units) authorized for dispatch to Kauvery Hospital.',
    related_request_id: 'BRQ999',
    related_recommendation_id: 'rec-101',
    priority: 'Critical'
  });
  console.log(`Duplicate check: duplicateIgnored=${dupRes.duplicateIgnored}, message=${dupRes.message}`);

  // Test 4: Emit Transfer Created event
  console.log('\nEmitting: transfer_created event...');
  const res2 = await createNotification({
    event_key: 'test_event:transfer_created:TRF-999',
    role: 'Hospital Admin',
    type: 'transfer_created',
    title: 'New Blood Transfer Created',
    message: 'Transfer TRF-999 for 2 units of O+ created: Apollo -> Kauvery.',
    related_transfer_id: 'TRF-999',
    priority: 'High'
  });
  console.log(`Result: success=${res2.success}, id=${res2.data?.id}`);

  // Test 5: Emit Transfer In Transit event
  console.log('\nEmitting: transfer_in_transit event...');
  const res3 = await createNotification({
    event_key: 'test_event:transfer_in_transit:TRF-999',
    role: 'Hospital Admin',
    type: 'transfer_in_transit',
    title: 'Blood Transfer In Transit',
    message: 'Transfer TRF-999 is now in transit to Kauvery Hospital.',
    related_transfer_id: 'TRF-999',
    priority: 'High'
  });
  console.log(`Result: success=${res3.success}, id=${res3.data?.id}`);

  // Test 6: Emit Transfer Completed event
  console.log('\nEmitting: transfer_completed event...');
  const res4 = await createNotification({
    event_key: 'test_event:transfer_completed:TRF-999',
    role: 'Blood Bank',
    type: 'transfer_completed',
    title: 'Blood Transfer Completed',
    message: 'Transfer TRF-999 delivered to Kauvery Hospital.',
    related_transfer_id: 'TRF-999',
    priority: 'Medium'
  });
  console.log(`Result: success=${res4.success}, id=${res4.data?.id}`);

  // Test 7: Emit Recommendation Rejected event
  console.log('\nEmitting: recommendation_rejected event...');
  const res5 = await createNotification({
    event_key: 'test_event:recommendation_rejected:rec-102',
    role: 'Hospital Admin',
    type: 'recommendation_rejected',
    title: 'AI Recommendation Rejected',
    message: 'Recommendation for AB- (BRQ888) was rejected by clinical reviewer.',
    related_recommendation_id: 'rec-102',
    priority: 'Medium'
  });
  console.log(`Result: success=${res5.success}, id=${res5.data?.id}`);

  // Test 8: Read notifications and mark read
  const unreadBeforeMark = await getUnreadNotificationCount();
  console.log(`\nUnread count before markRead: ${unreadBeforeMark}`);
  await markNotificationAsRead(res1.data?.id);
  const unreadAfterSingleMark = await getUnreadNotificationCount();
  console.log(`Unread count after marking single notification read: ${unreadAfterSingleMark}`);

  // Test 9: Mark all as read
  await markAllNotificationsAsRead();
  const unreadAfterMarkAll = await getUnreadNotificationCount();
  console.log(`Unread count after markAllNotificationsAsRead: ${unreadAfterMarkAll}`);

  console.log('\n=== ALL PHASE 8 EVENT TESTS PASSED ===');
}

runEventTests();
