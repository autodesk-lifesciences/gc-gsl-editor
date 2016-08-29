ace.define("ace/mode/gsl_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(acequire, exports, module) {
"use strict";

var autocompleteList = require('../../autocomplete');

var oop = acequire("../lib/oop");
var TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;

var GslHighlightRules = function() {

    var keywords = (
        "let|cut|end|for|in|open|do"
    );

    var builtinConstants = (
        "S288C"
    );

    var builtinPragmas = (
        "push|pop|warn|linkers|refgenome|dnasrc|name|fuse|stitch|megastitch|" +
        "rabitstart|rabitend|primerpos|warnoff|primermin|primermax|pcrparams|targettm|" +
        "seamlesstm|seamlessoverlaptm|atpenalty"
    );

    // adding GSL Genes to the wordlist.
    var keywordMapper = this.createKeywordMapper({
        "variable.language": "this",
        "keyword": keywords,
        "constant.language": builtinConstants,
        "support.function": builtinPragmas,
        "gsl.gene": autocompleteList.geneListString,
    }, "identifier");

    var escapedGeneList = [];
    autocompleteList.geneListString.split('|').forEach((el) => {
        var str = el.replace('(', '\\(');
        str = str.replace(')', '\\)');
        escapedGeneList.push(str);
    });

    // sort by string length.
    escapedGeneList.sort(function(a, b){
        return b.length - a.length;
    });

    var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
    var octInteger = "(?:0[oO]?[0-7]+)";
    var hexInteger = "(?:0[xX][\\dA-Fa-f]+)";
    var binInteger = "(?:0[bB][01]+)";
    var integer = "(?:" + decimalInteger + "|" + octInteger + "|" + hexInteger + "|" + binInteger + ")";

    var exponent = "(?:[eE][+-]?\\d+)";
    var fraction = "(?:\\.\\d+)";
    var intPart = "(?:\\d+)";
    var pointFloat = "(?:(?:" + intPart + "?" + fraction + ")|(?:" + intPart + "\\.))";
    var exponentFloat = "(?:(?:" + pointFloat + "|" +  intPart + ")" + exponent + ")";
    var floatNumber = "(?:" + exponentFloat + "|" + pointFloat + ")";

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : '\\(\\*.*?\\*\\)\\s*?$'
            },
            {
                token : "comment",
                regex : '\\(\\*.*',
                next : "comment"
            },
            {
                token : "comment",
                regex : "\\/\\/.*"
            },
            {
                token : "string", // single line
                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
            },
            {
                token : "string", // single char
                regex : "'.'"
            },
            {
                token : "string", // " string
                regex : '"',
                next  : "qstring"
            },
            {
                token : "constant.numeric", // float
                regex : /[+-]?\d[\d_]*(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?\b/
            },
            {
                token : "constant.numeric", // imaginary
                regex : "(?:" + floatNumber + "|\\d+)[jJ]\\b"
            },
            {
                token : "constant.numeric", // float
                regex : floatNumber
            },
            {
                token : "constant.numeric", // integer
                regex : integer + "\\b"
            },
            {   
                token : ["constant.numeric", "keyword.operator"],
                regex : "(" + integer + ")(S|E)" 
            },
            {
                token : ["keyword"],
                regex : "(let|cut|end|for|in|open|do)\\b"
            },
            {
                token : ["keyword.operator", "keyword.operator", "constant.gene"],
                regex : "(!)?(g|p|t|u|d|o|f|m|!|@|~|\\$)(" + escapedGeneList.join('|') + ")\\b"
            },
            {
                token : ["keyword.operator", "keyword.operator", "identifier"],
                regex : "(!)?(@)([a-zA-Z_$\-][a-zA-Z0-9_$\-]*)\\b"
            },
            {
                token : ["keyword.operator", "keyword.operator", "gsl.inline", "keyword.operator"],
                regex : "(\\/)(\\$)?([A|C|G|T|a|c|g|t]+)(\\/)"  // verify if we require more characters.
            },
            {
                token : "keyword.operator",
                regex : "\\+\\.|\\-\\.|\\*\\.|\\/\\.|#|;;|\\+|\\-|\\*|\\*\\*\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|<-|="
            },
            {
                token : keywordMapper,
                regex : "[a-zA-Z_$\-][a-zA-Z0-9_$\-]*\\b"
            },
            {
                token : "paren.lparen",
                regex : "[[({]"
            },
            {
                token : "paren.rparen",
                regex : "[\\])}]"
            },
            {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\)",
                next : "start"
            },
            {
                token : "comment", // comment spanning whole line
                regex : ".+"
            }
        ],

        "qstring" : [
            {
                token : "string",
                regex : '"',
                next : "start"
            }, {
                token : "string",
                regex : '.+'
            },
        ]
    };
};

oop.inherits(GslHighlightRules, TextHighlightRules);

exports.GslHighlightRules = GslHighlightRules;
});

ace.define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(acequire, exports, module) {
"use strict";

var Range = acequire("../range").Range;

var MatchingBraceOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        return line.match(/^\s*/)[0];
    };

}).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

ace.define("ace/mode/gsl",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/gsl_highlight_rules","ace/mode/matching_brace_outdent","ace/range"], function(acequire, exports, module) {
"use strict";

var oop = acequire("../lib/oop");
var TextMode = acequire("./text").Mode;
var GslHighlightRules = acequire("./gsl_highlight_rules").GslHighlightRules;
var MatchingBraceOutdent = acequire("./matching_brace_outdent").MatchingBraceOutdent;
var WorkerClient = acequire("../worker/worker_client").WorkerClient;
var Range = acequire("../range").Range;

var Mode = function() {
    this.HighlightRules = GslHighlightRules;
    
    this.$outdent   = new MatchingBraceOutdent();
};
oop.inherits(Mode, TextMode);

var indenter = /(?:[({[=:]|[-=]>|\b(?:else|try|with))\s*$/;

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var i, line;
        var outdent = true;
        var re = /^\s*\(\*(.*)\*\)/;

        for (i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        var range = new Range(0, 0, 0, 0);
        for (i=startRow; i<= endRow; i++) {
            line = doc.getLine(i);
            range.start.row  = i;
            range.end.row    = i;
            range.end.column = line.length;

            doc.replace(range, outdent ? line.match(re)[1] : "(*" + line + "*)");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
        var tokens = this.getTokenizer().getLineTokens(line, state).tokens;

        if (!(tokens.length && tokens[tokens.length - 1].type === 'comment') &&
            state === 'start' && indenter.test(line))
            indent += tab;
        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };


    // Adding this for syntax checking.
    /*
    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], require("../syntaxValidation/worker/javascript"), "JavaScriptWorker");
        worker.attachToDocument(session.getDocument());

        worker.on("annotate", function(results) {
            session.setAnnotations(results.data);
        });

        worker.on("terminate", function() {
            session.clearAnnotations();
        });

        return worker;
    };*/

    /* end of code for syntax checking */

    this.$id = "ace/mode/gsl";
}).call(Mode.prototype);

exports.Mode = Mode;
});