var g_startOffset = null;
var g_selectedPiece = null;
var moveNumber = 1;

var g_allMoves = [];
var g_playerWhite = true;
var g_changingFen = false;
var g_analyzing = false;

var g_uiBoard;
var g_cellSize = 45;

function UINewGame() {
    moveNumber = 1;
    
    Application.pgnValue = "";

    // var pgnTextBox = document.getElementById("PgnTextBox");
    // pgnTextBox.value = "";

    EnsureAnalysisStopped();
    ResetGame();
    if (InitializeBackgroundEngine()) {
        g_backgroundEngine.postMessage("go");
    }
    g_allMoves = [];
    RedrawBoard();

    if (!g_playerWhite) {
        SearchAndRedraw();
    }
}

function EnsureAnalysisStopped() {
    if (g_analyzing && g_backgroundEngine != null) {
        g_backgroundEngine.terminate();
        g_backgroundEngine = null;
    }
}

function UIAnalyzeToggle() {
    if (InitializeBackgroundEngine()) {
        if (!g_analyzing) {
            g_backgroundEngine.postMessage("analyze");
        } else {
            EnsureAnalysisStopped();
        }
        g_analyzing = !g_analyzing;
        document.getElementById("AnalysisToggleLink").innerText = g_analyzing ? "Analysis: On" : "Analysis: Off";
    } else {
        alert("Your browser must support web workers for analysis - (chrome4, ff4, safari)");
    }
}

function UIChangeFEN() {
    if (!g_changingFen) {
        var fenTextBox = document.getElementById("FenTextBox");
        var result = InitializeFromFen(fenTextBox.value);
        if (result.length != 0) {
            UpdatePVDisplay(result);
            return;
        } else {
            UpdatePVDisplay('');
        }
        g_allMoves = [];

        EnsureAnalysisStopped();
        InitializeBackgroundEngine();

        g_playerWhite = !!g_toMove;
        g_backgroundEngine.postMessage("position " + GetFen());

        RedrawBoard();
    }
}

function UIChangeStartPlayer() {
    g_playerWhite = !g_playerWhite;
    RedrawBoard();
}

function UpdatePgnTextBox(move) {
    // var pgnTextBox = document.getElementById("PgnTextBox");
    if (g_toMove != 0) {
        // pgnTextBox.value += moveNumber + ". ";
        moveNumber++;
    }
    // pgnTextBox.value += GetMoveSAN(move) + " ";
    console.log(GetMoveSAN(move));
}

function UIChangeTimePerMove() {
    var timePerMove = document.getElementById("TimePerMove");
    g_timeout = parseInt(timePerMove.value, 10);
}

function FinishMove(bestMove, value, timeTaken, ply) {
    if (bestMove != null) {
        UIPlayMove(bestMove, BuildPVMessage(bestMove, value, timeTaken, ply));
    } else {
        alert("Checkmate!");
    }
}

function UIPlayMove(move, pv) {
    UpdatePgnTextBox(move);

    g_allMoves[g_allMoves.length] = move;
    MakeMove(move);

    UpdatePVDisplay(pv);

    UpdateFromMove(move);
}

function UIUndoMove() {
  if (g_allMoves.length == 0) {
    return;
  }

  if (g_backgroundEngine != null) {
    g_backgroundEngine.terminate();
    g_backgroundEngine = null;
  }

  UnmakeMove(g_allMoves[g_allMoves.length - 1]);
  g_allMoves.pop();

  if (g_playerWhite != !!g_toMove && g_allMoves.length != 0) {
    UnmakeMove(g_allMoves[g_allMoves.length - 1]);
    g_allMoves.pop();
  }

  RedrawBoard();
}

function UpdatePVDisplay(pv) {
    console.log(pv);
}

function SearchAndRedraw() {
    console.log("search & redraw");
    if (g_analyzing) {
        EnsureAnalysisStopped();
        InitializeBackgroundEngine();
        g_backgroundEngine.postMessage("position " + GetFen());
        g_backgroundEngine.postMessage("analyze");
        return;
    }

    if (InitializeBackgroundEngine()) {
        g_backgroundEngine.postMessage("search " + g_timeout);
    } else {
        Search(FinishMove, 99, null);
    }
}

var g_backgroundEngineValid = true;
var g_backgroundEngine;

function InitializeBackgroundEngine() {
    if (!g_backgroundEngineValid) {
        return false;
    }

    if (g_backgroundEngine == null) {
        g_backgroundEngineValid = true;
        try {
            g_backgroundEngine = new Worker("js/ai/garbochess.js");
            g_backgroundEngine.onmessage = function (e) {
                if (e.data.match("^pv") == "pv") {
                    UpdatePVDisplay(e.data.substr(3, e.data.length - 3));
                } else if (e.data.match("^message") == "message") {
                    EnsureAnalysisStopped();
                    UpdatePVDisplay(e.data.substr(8, e.data.length - 8));
                } else {
                    UIPlayMove(GetMoveFromString(e.data), null);
                }
            }
            g_backgroundEngine.error = function (e) {
                alert("Error from background worker:" + e.message);
            }
            g_backgroundEngine.postMessage("position " + GetFen());
        } catch (error) {
            g_backgroundEngineValid = false;
        }
    }

    return g_backgroundEngineValid;
}

function UpdateFromMove(move) {
    var fromX = (move & 0xF) - 4;
    var fromY = ((move >> 4) & 0xF) - 2;
    var toX = ((move >> 8) & 0xF) - 4;
    var toY = ((move >> 12) & 0xF) - 2;

    if (!g_playerWhite) {
        fromY = 7 - fromY;
        toY = 7 - toY;
        fromX = 7 - fromX;
        toX = 7 - toX;
    }
    
    RedrawBoard();
    
    if (validMoves.length == 0) {
        alert("Checkmate!");
    }

    /*if ((move & moveflagCastleKing) ||
        (move & moveflagCastleQueen) ||
        (move & moveflagEPC) ||
        (move & moveflagPromotion)) {
        RedrawPieces();
    } else {
        
    }*/
}

function RedrawBoard() {
    g_uiBoard = [];
    validMoves = GenerateValidMoves();

    Application.ClearBoard();
    Application.UpdatePieces();

    g_changingFen = true;
    Application.SetFen(GetFen());
    g_changingFen = false;
}
