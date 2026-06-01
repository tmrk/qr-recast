export const qrTypeFixtures = Object.freeze([
  {
    fieldKeys: ['scheme', 'host', 'path'],
    name: 'HTTPS URL',
    payload: 'https://example.com/products?id=12',
    type: 'url',
  },
  {
    fieldKeys: ['host'],
    name: 'Bare domain',
    payload: 'example.org/help',
    type: 'url',
  },
  {
    fieldKeys: ['textLength'],
    name: 'Plain text',
    payload: 'Keep this code somewhere safe.',
    type: 'plain-text',
  },
  {
    fieldKeys: ['ssid', 'authType', 'password', 'hidden'],
    name: 'Wi-Fi network',
    payload: 'WIFI:T:WPA;S:Kitchen Wi-Fi;P:s3cret\\;value;H:true;;',
    type: 'wifi',
  },
  {
    expectedFields: {
      setupCode: '84131633',
    },
    fieldKeys: ['setupCode', 'setupPayload', 'encodedParameters', 'setupId'],
    name: 'Apple Home setup payload',
    payload: 'X-HM://0081YCYEP3QYT',
    type: 'homekit',
  },
  {
    expectedFields: {
      manualCode: '34970112332',
    },
    fieldKeys: ['manualCode', 'onboardingPayload', 'payloadFormat'],
    name: 'Matter onboarding payload',
    payload: 'MT:Y.K9042C00KA0648G00',
    type: 'matter',
  },
  {
    expectedFields: {
      manualCode: '25906020391',
    },
    fieldKeys: ['manualCode', 'onboardingPayload', 'payloadFormat'],
    name: 'Matter label setup payload',
    payload: 'MT:OA3126F-034OCH6VQ00',
    type: 'matter',
  },
  {
    fieldKeys: ['emailAddress', 'subject', 'body'],
    name: 'Mailto email',
    payload: 'mailto:hello@example.com?subject=Hello&body=Welcome',
    type: 'email',
  },
  {
    fieldKeys: ['emailAddress', 'subject', 'body'],
    name: 'MATMSG email',
    payload: 'MATMSG:TO:hello@example.com;SUB:Hello;BODY:Welcome;;',
    type: 'email',
  },
  {
    fieldKeys: ['number', 'message'],
    name: 'SMS message',
    payload: 'sms:+441234567890?body=Hello%20there',
    type: 'sms',
  },
  {
    fieldKeys: ['number'],
    name: 'Telephone number',
    payload: 'tel:+441234567890',
    type: 'tel',
  },
  {
    fieldKeys: ['latitude', 'longitude', 'query'],
    name: 'Geo location',
    payload: 'geo:51.501,-0.141?q=Buckingham%20Palace',
    type: 'geo',
  },
  {
    fieldKeys: ['summary', 'start', 'end', 'location'],
    name: 'Calendar event',
    payload:
      'BEGIN:VEVENT\nSUMMARY:Service visit\nDTSTART:20260601T090000Z\nDTEND:20260601T100000Z\nLOCATION:Workshop\nEND:VEVENT',
    type: 'calendar',
  },
  {
    fieldKeys: ['name', 'phone', 'emailAddress', 'organisation'],
    name: 'vCard contact',
    payload:
      'BEGIN:VCARD\nVERSION:3.0\nFN:Alex Smith\nORG:Example Ltd\nTEL:+441234567890\nEMAIL:alex@example.com\nEND:VCARD',
    type: 'contact',
  },
  {
    fieldKeys: ['name', 'phone', 'emailAddress', 'organisation'],
    name: 'MeCard contact',
    payload: 'MECARD:N:Alex Smith;ORG:Example Ltd;TEL:+441234567890;EMAIL:alex@example.com;;',
    type: 'contact',
  },
  {
    fieldKeys: ['scheme', 'address'],
    name: 'Crypto payment',
    payload: 'bitcoin:1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
    type: 'crypto',
  },
  {
    fieldKeys: ['scheme', 'target'],
    name: 'App deep link',
    payload: 'upi://pay?pa=merchant@example&pn=Example',
    type: 'app-link',
  },
]);
