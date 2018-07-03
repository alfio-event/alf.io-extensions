/**
 * Extension for performing formal validation on Italian VAT Number ("Partita IVA")
 * We need this additional control, as not all companies are registered in the VIES EU web service
 */
function getScriptMetadata() {
    return {
        id: 'it-iva-validation', //
        displayName: 'IT IVA Validation',
        version: 1, //
        async: false,
        events: [
            'TAX_ID_NUMBER_VALIDATION'
        ]
    };
}

function executeScript(scriptEvent) {

    return output || ('TAX_ID_NUMBER_VALIDATION' === scriptEvent
        && 'IT' === countryCode
        && taxIdNumber && taxIdNumber.length === 11
        && validateIVA(taxIdNumber));
}

function validateIVA(number) {
    if(!/^\d{11}$/.test(number)) {
        return false;
    }
    var digits = number.split('');
    var sumEven = digits.filter(function(n, i) { return i % 2 !== 0; }).map(function(i) {return parseInt(i, 10);}).reduce(function(accumulator, current) {
       var product = current * 2;
       return accumulator + (product > 9 ? product - 9 : product);
    }, 0);
    var sumOdd = digits.filter(function(n, i) { return i < digits.length - 1 && i % 2 === 0; }).map(function(i) {return parseInt(i, 10);}).reduce(function(accumulator, current) {return accumulator + current;}, 0);
    var controlDigit = (sumEven + sumOdd) % 10;
    if(controlDigit > 0) {
        controlDigit = 10 - controlDigit;
    }
    return parseInt(digits[digits.length - 1], 10) === controlDigit;
}