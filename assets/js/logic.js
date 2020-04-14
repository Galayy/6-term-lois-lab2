let controller;

window.addEventListener('load', () => {
    let formula = document.getElementById('panel');
    formula.value = generateFormula();
});

function createController() {
    let holder = new ExpressionHolder();
    let calcView = new CalculatorView();
    controller = new Controller(holder, calcView);
}

class Controller {
    constructor(holder, calculatorView) {
        this.holder = holder;
        this.calculatorView = calculatorView;
    }

    makePDNF() {
        this.holder.addExpression(document.getElementById('panel').value);
        if (!this.holder.checkBracket()) {
            this.calculatorView.clearTable();
            this.calculatorView.renderTextResult("Неправильно расставленны скобки");
            return;
        }
        if (!this.holder.isDnfFormula()) {
            this.calculatorView.clearTable();
            this.calculatorView.renderTextResult("Неправильная формула");
            return;
        }

        let arrayWithLiteral = this.holder.getArrayWithLiteral();
        let countRow = Math.pow(2, arrayWithLiteral.length);
        let table = this.holder.madeTruthTable(arrayWithLiteral, countRow);

        let result = ExpressionHolder.makePDNF(table, arrayWithLiteral, countRow);

        this.calculatorView.renderTable(table, arrayWithLiteral);
        this.calculatorView.renderTextResult(result === "" ? "0" : result);
    }

    buildTest(formula) {
        this.holder.addExpression(formula);
        if (!this.holder.checkBracket() || !this.holder.isDnfFormula()) {
            return "";
        }

        let arrayWithLiteral = this.holder.getArrayWithLiteral();
        let countRow = Math.pow(2, arrayWithLiteral.length);
        let table = this.holder.madeTruthTable(arrayWithLiteral, countRow);

        return ExpressionHolder.makePDNF(table, arrayWithLiteral, countRow);
    }
}

class ExpressionHolder {

    constructor() {
        this.expression = document.getElementById('panel');
    }

    addExpression(expression) {
        this.expression = expression;
    }

    checkBracket() {
        let bracketCounter = 0;
        for (let i = 0; i < this.expression.length; i++) {
            let digit = this.expression.charAt(i);
            if (digit === '(')
                bracketCounter++;
            if (digit === ')')
                bracketCounter--;
        }
        return bracketCounter === 0;
    }

    isDnfFormula() {
        let formula = this.expression;
        let testSymbol = 'A';
        let negative = /\(![A-Z01]\)/g;
        let expression = /\((\(![A-Z01]\)|[A-Z01]|\(A\))[|&~](\(![A-Z01]\)|[A-Z01]|\(A\))\)/g;
        let impl = /\((\(![A-Z01]\)|[A-Z01]|\(A\))->(\(![A-Z01]\)|[A-Z01]|\(A\))\)/g;

        while (formula.match(expression) !== null) {
            formula = formula.replace(expression, testSymbol);
        }

        while (formula.match(impl) !== null) {
            formula = formula.replace(impl, testSymbol);
        }

        while (formula.match(negative) !== null) {
            formula = formula.replace(negative, testSymbol);
        }

        return formula === testSymbol;
    }

    static makePDNF(table, arrayWithLiteral, countRow) {
        let resultColumn = arrayWithLiteral.length;
        let array = [];
        for (let index = 0; index < countRow; index++) {
            if (table[index][resultColumn] === "1") {
                let formula = ExpressionHolder.makeSubFormulaForRow(table[index], arrayWithLiteral);
                array.push(formula);
            }
        }
        return array.join("|");
    }

    static makeSubFormulaForRow(row, arrayWithLiteral) {
        let formula = "";
        if (arrayWithLiteral.length > 1) {
            formula += "(";
        }

        for (let index = 0; index < arrayWithLiteral.length; index++) {
            if (row[index] === "0") {
                formula += "(!" + arrayWithLiteral[index] + ")";
            } else {
                formula += arrayWithLiteral[index];
            }
            if (index !== arrayWithLiteral.length - 1) {
                formula += "&";
            }
            if (index < arrayWithLiteral.length - 2) {
                formula += '(';
            }
        }
        for (let index = 0; index < arrayWithLiteral.length - 1; index++) {
            formula += ')';
        }
        return formula;
    }

    madeTruthTable(arrayWithLiteral, countRow) {
        let table = [];

        for (let index = 0; index < countRow; index++) {
            let row = [];
            let byte = ExpressionHolder.numberToBinaryString(index, arrayWithLiteral.length);
            row.push(...byte);
            row.push(this.getResultForRow(byte, arrayWithLiteral));
            table.push(row);
        }
        return table;
    }

    getArrayWithLiteral() {
        let arrayWithLiteral = [];
        for (let index = 0; index < this.expression.length; index++) {
            let str = this.expression[index];
            if (str.match(/[A-Z]/) !== null && !arrayWithLiteral.includes(str)) {
                arrayWithLiteral.push(str);
            }
        }
        return arrayWithLiteral;
    }

    static numberToBinaryString(number, stringLength) {
        let string = (number >>> 0).toString(2);
        for (let i = string.length; i < stringLength; i++) {
            string = "0" + string;
        }
        return string;
    }

    getResultForRow(byte, arrayWithLiteral) {
        let map = {};
        for (let index in arrayWithLiteral) {
            map[arrayWithLiteral[index]] = byte.charAt(index++);
        }
        let newString = ExpressionHolder.replaceLogicSymbol(this.expression);
        for (let index in Object.keys(map)) {
            let key = Object.keys(map)[index];
            while (newString.match(key) != null) {
                newString = newString.replace(key, map[key]);
            }
        }
        if (eval(newString)) {
            return "1";
        } else {
            return "0";
        }
    }

    static replaceLogicSymbol(string) {
        let newString = [];
        for (let index = 0; index < string.length; index++) {
            let symbol = string[index];
            if (symbol === "&") {
                newString.push("&&");
            } else if (symbol === "|") {
                newString.push("||");
            } else if (symbol === "~") {
                newString.push("===");
            } else if (symbol === "-" && string[++index] === ">") {
                let literal = newString.pop();
                let str = "";
                if (literal === ")") {
                    let brackets = [];
                    brackets.push(literal);
                    let buffer = [];
                    buffer.push(literal);
                    while (brackets.length > 0) {
                        let substring = newString.pop();
                        if (substring === "(") {
                            brackets.pop();
                        } else if (substring === ")") {
                            brackets.push(substring);
                        }
                        buffer.push(substring);
                    }
                    buffer = buffer.reverse();
                    str = "(!" + buffer.join("") + ")||";
                } else {
                    str = "(!" + literal + ")||";
                }
                newString.push(...str);
            } else {
                newString.push(symbol);
            }
        }
        return newString.join("");
    }
}

class CalculatorView {
    constructor() {
        this.result = document.getElementById('result');
        this.table = document.getElementById('table');
    }

    renderTextResult(expression) {
        this.result.innerText = "СДНФ: " + expression;
    }

    clearTable() {
        this.table.innerHTML = "";
    }

    renderTable(table, arrayWithLiteral) {
        let size = Math.pow(2, arrayWithLiteral.length);
        let innerHTML = "<thead>";
        let tr = "<tr>";
        for (let key = 0; key < arrayWithLiteral.length; key++) {
            tr += "<td>" + arrayWithLiteral[key] + "</td>";
        }
        tr += "<td>" + "result" + "</td>";
        tr += "</tr>";
        innerHTML += "</thead>";
        innerHTML += "<tbody>";
        innerHTML += tr;
        for (let i = 0; i < size; i++) {
            let row = table[i];
            let rowTr = "<tr>";
            for (let index = 0; index < row.length; index++) {
                let val = row[index];
                rowTr += "<td>" + val + "</td>"
            }
            rowTr += "</tr>";
            innerHTML += rowTr;
        }
        innerHTML += "</tbody>";
        this.table.innerHTML = innerHTML;
    }
}
