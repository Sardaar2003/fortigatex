const axios = require('axios');

class PSOnlineService {
  constructor() {
    this.apiUrl = 'https://app.periodicalservices.com/api/woocommerce/v1.9/process.asp';
    this.apiKey = process.env.PSONLINE_API_KEY;
    this.merchantId = process.env.PSONLINE_MERCHANT_ID;

    // Enhanced debug logging
    console.log('\n=== PSOnlineService Initialization ===');
    console.log('API URL:', this.apiUrl);
    console.log('API Key:', this.apiKey ? 'Present' : 'Missing');
    console.log('Merchant ID:', this.merchantId ? 'Present' : 'Missing');
    console.log('Environment variables:', {
      PSONLINE_API_KEY: process.env.PSONLINE_API_KEY ? 'Present' : 'Missing',
      PSONLINE_MERCHANT_ID: process.env.PSONLINE_MERCHANT_ID ? 'Present' : 'Missing'
    });
    console.log('====================================\n');
  }

  async processOrder(orderData) {
    try {
      console.log('\n=== PSOnline Service: processOrder Started ===');
      
      // Validate credentials before proceeding
      if (!this.apiKey || !this.merchantId) {
        console.error('PSOnline credentials missing:', {
          apiKey: !!this.apiKey,
          merchantId: !!this.merchantId
        });
        throw new Error('PSOnline credentials are missing. Please check your environment variables.');
      }

      console.log('PSOnline credentials validated successfully');
      console.log('\n=== Processing PSOnline Order ===');
      console.log('Order data received:', {
        ...orderData,
        card_num: orderData.card_num ? `${orderData.card_num.substring(0, 4)}****${orderData.card_num.substring(-4)}` : 'Missing',
        card_cvv: orderData.card_cvv ? '***' : 'Missing'
      });

      console.log('Building request payload with credentials...');
      const orderDataWithCredentials = {
        ...orderData,
        APIKey: this.apiKey,
        MerchantID: this.merchantId,
        bincheck: 1 // Enable BIN checking against internal reject list
      };

      console.log('Request payload prepared:', {
        ...orderDataWithCredentials,
        APIKey: this.apiKey ? 'Present' : 'Missing',
        MerchantID: this.merchantId ? 'Present' : 'Missing',
        bincheck: orderDataWithCredentials.bincheck
      });
      console.log('PSOnline API URL:', this.apiUrl);

      console.log('Sending request to PSOnline API...');
      console.log('Request URL:', this.apiUrl);
      console.log('Request method: POST');
      console.log('Request headers:', {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PSOnline-Client'
      });
      
      const response = await axios.post(this.apiUrl, orderDataWithCredentials);
      console.log('=== PSOnline API Response Details ===');
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', JSON.stringify(response.headers, null, 2));
      console.log('Response data (raw):', JSON.stringify(response.data, null, 2));
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));
      console.log('Full response object:', response);
      
      // Check if response.data is a string that needs parsing
      let processedResponse = response.data;
      if (typeof response.data === 'string') {
        console.log('Response is a string, attempting to parse...');
        try {
          processedResponse = JSON.parse(response.data);
          console.log('Successfully parsed string response:', processedResponse);
        } catch (parseError) {
          console.log('Could not parse as JSON, using as-is');
          processedResponse = response.data;
        }
      }
      
      console.log('Final processed response:', processedResponse);
      console.log('====================================\n');

      // Return the complete response data
      return processedResponse;
    } catch (error) {
      console.error('\n=== PSOnline API Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      console.error('====================================\n');

      throw new Error(error.response?.data?.ResponseData || 'Failed to process order with PSOnline');
    }
  }

  validateOrderData(orderData) {
    console.log('\n=== PSOnline Service: validateOrderData Started ===');
    console.log('Validating order data:', {
      ...orderData,
      card_num: orderData.card_num ? `${orderData.card_num.substring(0, 4)}****${orderData.card_num.substring(-4)}` : 'Missing',
      card_cvv: orderData.card_cvv ? '***' : 'Missing'
    });
    
    // BIN Reject List - States that are not allowed for PSOnline orders
    const rejectedStates = ['ME', 'IA', 'UT', 'MN', 'VT', 'KS', 'WI', 'MO'];

    // BIN Reject List - Card numbers starting with these BINs are not allowed
    const rejectedBins = [
      400022, 400167, 400218, 400344, 400799, 400898, 400899, 401532, 401543, 402018,
      402087, 402321, 402464, 403015, 403163, 403216, 403446, 403623, 403833, 403905,
      403995, 404657, 405037, 405496, 405960, 406018, 406032, 406042, 406049, 406095,
      406498, 407166, 407221, 407535, 407624, 407887, 408104, 408540, 408832, 408881,
      409311, 409451, 409589, 409758, 409970, 409975, 410039, 410040, 410064, 410793,
      410836, 410846, 411079, 411111, 411238, 411352, 411449, 411501, 411507, 411568,
      411573, 411770, 411771, 411773, 411774, 411776, 411810, 412055, 412185, 412421,
      412451, 412654, 413037, 413040, 414094, 414238, 414364, 414397, 414398, 414446,
      414512, 414709, 414718, 414720, 414724, 414734, 414740, 414776, 414778, 414794,
      415158, 415417, 415560, 415976, 415977, 415978, 415982, 416046, 416085, 416832,
      416860, 416993, 416994, 416995, 417021, 418940, 418953, 419002, 419047, 419423,
      419455, 420064, 420231, 420495, 420767, 421783, 422311, 422481, 422957, 422967,
      422968, 423223, 423766, 423817, 423821, 423910, 424030, 424067, 424631, 424840,
      425131, 425300, 425307, 425628, 425704, 425808, 425828, 425836, 425838, 425907,
      426191, 426290, 426428, 426576, 426684, 426690, 426937, 426938, 426939, 427082,
      427178, 427514, 427538, 427569, 429413, 429544, 429819, 429820, 430070, 430572,
      430665, 431196, 431307, 431503, 431732, 432630, 432672, 432825, 433077, 433177,
      433280, 433718, 433747, 434256, 434258, 434292, 434340, 434769, 435140, 435142,
      435541, 435544, 435545, 435546, 435603, 435643, 435716, 435836, 435880, 436127,
      436618, 436885, 438854, 438857, 438958, 438959, 439707, 439878, 440066, 440230,
      440393, 441104, 441105, 441297, 441839, 441840, 442347, 442505, 442644, 442657,
      442742, 442743, 442756, 442790, 442792, 442795, 442939, 443040, 443042, 443045,
      443046, 443047, 443051, 443057, 443113, 443161, 443264, 443512, 443585, 443589,
      443603, 444607, 444796, 445100, 445101, 445102, 445171, 445250, 446019, 446053,
      446317, 446539, 446542, 446601, 446613, 446614, 446705, 447227, 447581, 447669,
      447775, 447914, 447954, 447972, 447993, 447994, 447995, 448223, 448233, 448251,
      448261, 448774, 448825, 449209, 449210, 449435, 449449, 449465, 449553, 451002,
      451336, 451440, 453506, 454507, 455552, 457431, 458415, 458453, 460728, 461046,
      461100, 461608, 462161, 462661, 463153, 463405, 463829, 465345, 466189, 466992,
      467010, 468013, 468839, 470132, 470134, 470320, 470793, 472728, 473063, 473139,
      473310, 473336, 473690, 473702, 473703, 473931, 474165, 474166, 474472, 474473,
      474474, 474475, 474476, 474477, 474478, 474481, 474485, 474487, 474489, 474665,
      475056, 475869, 476546, 476970, 478200, 478433, 478975, 479126, 479213, 479841,
      479851, 480209, 480213, 481176, 481582, 481583, 481588, 482812, 483312, 483313,
      483314, 483316, 483365, 483492, 483950, 484718, 484722, 485320, 486732, 486742,
      486796, 487900, 487917, 490071, 490097, 491277, 491278, 491288, 494160, 494383,
      498503, 498563, 510250, 510277, 510349, 510404, 510599, 510624, 510774, 510796,
      510805, 510855, 510875, 510921, 510930, 510933, 510936, 510941, 510967, 510987,
      511020, 511058, 511089, 511118, 511184, 511271, 511308, 511317, 511332, 511350,
      511360, 511413, 511516, 511541, 511563, 511786, 511822, 511832, 511897, 511959,
      512106, 512107, 512174, 512230, 512333, 512474, 512876, 512992, 513547, 514021,
      514104, 514138, 514149, 514173, 514185, 514186, 514222, 514228, 514230, 514309,
      514348, 514377, 514380, 514401, 514441, 514491, 514518, 514616, 514735, 514736,
      514759, 514793, 514887, 514891, 514968, 515034, 515061, 515147, 515223, 515239,
      515241, 515254, 515307, 515554, 515557, 515574, 515599, 515645, 515676, 515678,
      515735, 515942, 516086, 516121, 516488, 516501, 516578, 516648, 516693, 517148,
      517278, 517479, 517542, 517545, 517546, 517572, 517800, 517805, 517862, 517872,
      517884, 518702, 518725, 518752, 518778, 518941, 519100, 519282, 519452, 519457,
      519835, 519836, 519985, 520266, 520278, 520299, 520524, 520602, 520711, 520943,
      521105, 521131, 521333, 521730, 521844, 521853, 521870, 521876, 521991, 521997,
      522094, 522561, 523081, 523568, 523652, 523668, 523782, 523957, 524038, 524300,
      524303, 524304, 524306, 524363, 524364, 524366, 525107, 525362, 525363, 525475,
      525691, 526188, 526226, 526227, 526264, 526291, 526449, 526484, 526534, 526924,
      526926, 526929, 526947, 527319, 527368, 527480, 527505, 527515, 527517, 527518,
      527519, 527520, 527521, 527523, 527690, 527845, 527854, 528072, 528217, 528432,
      528546, 528710, 528749, 528847, 529062, 529099, 529115, 529149, 529263, 529580,
      530046, 530654, 530964, 531105, 531106, 531108, 531257, 531258, 531259, 531260,
      531262, 531278, 532211, 532254, 532514, 532569, 532578, 532605, 532828, 532839,
      533362, 534303, 534456, 534756, 534774, 534859, 534860, 534869, 534901, 535456,
      536062, 536219, 536759, 536817, 536821, 537802, 537811, 537986, 538082, 538875,
      538923, 538976, 539186, 539225, 539226, 539483, 539556, 539610, 539634, 539655,
      539689, 540219, 540324, 540342, 540385, 540404, 540653, 540707, 540789, 541065,
      541071, 541111, 541413, 541433, 541505, 542179, 542217, 542418, 542432, 542442,
      542543, 542784, 543668, 543701, 543703, 543803, 544205, 544543, 544579, 544602,
      544632, 544722, 544768, 544927, 544928, 545212, 545236, 545313, 545436, 545443,
      545510, 545563, 545660, 545669, 545958, 546143, 546174, 546199, 546213, 546221,
      546268, 546325, 546356, 546379, 546533, 546540, 546604, 546616, 546617, 546626,
      546630, 546632, 546633, 546638, 546641, 546645, 547182, 547415, 547519, 548029,
      548030, 548042, 548043, 549035, 549110, 549113, 549170, 549429, 549460, 549686,
      549769, 549806, 550442, 550779, 550806, 550807, 550860, 550905, 550934, 551046,
      551050, 551056, 551076, 551128, 551149, 551164, 551165, 551195, 551292, 551336,
      551338, 551571, 551627, 551733, 551738, 551791, 551814, 551820, 551938, 552225,
      552285, 552318, 552319, 552321, 552322, 552330, 552342, 552356, 552393, 552433,
      552465, 552486, 552499, 552712, 552736, 552851, 552869, 553453, 553732, 553734,
      553811, 553907, 553968, 553981, 554085, 554869, 555440, 557567, 557619, 557621,
      558158, 558650, 558962, 559034, 559330, 559427, 559460, 559551, 559591, 559758,
      559920
    ];

    const requiredFields = [
      'domain',
      'card_num',
      'card_expm',
      'card_expy',
      'card_cvv',
      'CustomerFirstName',
      'CustomerLastName',
      'BillingStreetAddress',
      'BillingCity',
      'BillingState',
      'BillingZipCode',
      'Email',
      'BillingHomePhone',
      'amount',
      'ProductCount'
    ];

    console.log('Checking required fields...');
    const missingFields = requiredFields.filter(field => !orderData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    console.log('All required fields present');

    // Validate BIN reject list - check if state is in rejected states
    console.log('Checking state validation...');
    console.log('Billing state:', orderData.BillingState);
    if (rejectedStates.includes(orderData.BillingState.toUpperCase())) {
      console.error('State rejected:', orderData.BillingState);
      throw new Error(`Orders from ${orderData.BillingState} are not currently accepted. Please contact support for assistance.`);
    }
    console.log('State validation passed');

    // Validate BIN reject list - check if card number starts with rejected BIN
    console.log('Checking BIN validation...');
    const cardNumber = orderData.card_num.replace(/\s/g, '');
    const cardBin = parseInt(cardNumber.substring(0, 6));
    console.log('Card BIN:', cardBin);
    if (rejectedBins.includes(cardBin)) {
      console.error('BIN rejected:', cardBin);
      throw new Error(`This card type is not currently accepted. Please use a different payment method.`);
    }
    console.log('BIN validation passed');

    // Validate card number format (15-16 digits)
    console.log('Validating card number format...');
    if (!/^\d{15,16}$/.test(orderData.card_num.replace(/\s/g, ''))) {
      console.error('Invalid card number format');
      throw new Error('Invalid card number format (must be 15 or 16 digits)');
    }
    console.log('Card number format valid');

    // Validate CVV format (3-4 digits)
    console.log('Validating CVV format...');
    if (!/^\d{3,4}$/.test(orderData.card_cvv)) {
      console.error('Invalid CVV format');
      throw new Error('Invalid CVV format (must be 3 or 4 digits)');
    }
    console.log('CVV format valid');

    // Validate phone number format (10 digits)
    console.log('Validating phone number format...');
    if (!/^\d{10}$/.test(orderData.BillingHomePhone.replace(/\D/g, ''))) {
      console.error('Invalid phone number format');
      throw new Error('Invalid phone number format (must be 10 digits)');
    }
    console.log('Phone number format valid');

    // Validate email format
    console.log('Validating email format...');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.Email)) {
      console.error('Invalid email format');
      throw new Error('Invalid email format');
    }
    console.log('Email format valid');

    // Validate date formats
    if (orderData.DOB) {
      console.log('Validating DOB format...');
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(orderData.DOB)) {
        console.error('Invalid DOB format');
        throw new Error('Invalid date format (must be MM/DD/YYYY)');
      }
      console.log('DOB format valid');
    }

    // Validate Gender if provided
    if (orderData.Gender) {
      console.log('Validating Gender...');
      if (!['M', 'F'].includes(orderData.Gender)) {
        console.error('Invalid Gender value');
        throw new Error('Gender must be M or F');
      }
      console.log('Gender valid');
    }

    // Validate amount is a positive number
    console.log('Validating amount...');
    if (isNaN(orderData.amount) || orderData.amount <= 0) {
      console.error('Invalid amount');
      throw new Error('Amount must be a positive number');
    }
    console.log('Amount valid:', orderData.amount);

    console.log('=== PSOnline Service: validateOrderData Completed Successfully ===\n');
    return true;
  }
}

module.exports = new PSOnlineService(); 