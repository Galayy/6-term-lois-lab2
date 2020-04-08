function generateFormula() {
    let arity = Math.floor(Math.random() * 2) + 1;
    let formula = "(";
    if (arity === 1) {
        formula = formula.concat("!");
        formula = formula.concat(generateElement());
    } else if (arity === 2) {
        formula = formula.concat(generateElement());
        let operatorType = Math.floor(Math.random() * GRAMMAR.binaryOperation.length);
        formula = formula.concat(GRAMMAR.binaryOperation[operatorType]).concat(generateElement());
    }
    formula = formula.concat(")");
    return formula;
}

function generateElement() {
    let type = Math.floor(Math.random() * 2);
    let element;
    if (type === 0) {
        element = generateFormula();
    } else {
        element = generateAtomicElement();
    }
    return element;
}

function generateAtomicElement() {
    let index;
    index = Math.floor(Math.random() * GRAMMAR.symbol.length);
    return GRAMMAR.symbol[index];
}

const GRAMMAR = {
    symbol: ["A", "B", "C", "D", "E", "F", "G", "H", "I",
        "J", "K", "L", "M", "N", "O", "P", "Q", "R",
        "S", "T", "U", "V", "W", "X", "Y", "Z"],
    bracket: ['(', ')'],
    unaryOperation: ['!'],
    binaryOperation: ['&', '|'],
};
