'use client';

import { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, any>>({});
  const [moveSquares, setMoveSquares] = useState<Record<string, any>>({});
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<string[]>([]);

  const getMoveOptions = useCallback((square: Square) => {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, any> = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to)?.color !== game.get(square)?.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }, [game]);

  const onSquareClick = useCallback(
    (square: Square) => {
      setRightClickedSquares({});

      // from square
      if (!moveFrom) {
        const hasMoves = getMoveOptions(square);
        if (hasMoves) setMoveFrom(square);
        return;
      }

      // to square
      if (!moveTo) {
        // check if valid move
        const moves = game.moves({
          square: moveFrom,
          verbose: true,
        });
        const foundMove = moves.find((m) => m.to === square);
        
        if (!foundMove) {
          // clicked different piece, reset
          const hasMoves = getMoveOptions(square);
          setMoveFrom(hasMoves ? square : null);
          return;
        }

        // promotion move
        if (foundMove.promotion) {
          setMoveTo(square);
          setShowPromotionDialog(true);
          return;
        }

        // normal move
        makeMove(moveFrom, square);
      }
    },
    [moveFrom, moveTo, game, getMoveOptions]
  );

  const makeMove = (from: Square, to: Square, promotion?: string) => {
    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from,
      to,
      promotion,
    });

    if (move) {
      setGame(gameCopy);
      setHistory((prev) => [...prev, move.san]);
      setMoveFrom(null);
      setMoveTo(null);
      setOptionSquares({});
    }
  };

  const onPromotionPieceSelect = (piece?: string) => {
    if (piece && moveFrom && moveTo) {
      makeMove(moveFrom, moveTo, piece[1].toLowerCase());
    }
    setShowPromotionDialog(false);
    return true;
  };

  const onSquareRightClick = (square: Square) => {
    const colour = 'rgba(255, 0, 0, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  };

  const resetGame = () => {
    setGame(new Chess());
    setHistory([]);
    setMoveFrom(null);
    setMoveTo(null);
    setOptionSquares({});
    setRightClickedSquares({});
  };

  const undoMove = () => {
    const gameCopy = new Chess(game.fen());
    gameCopy.undo();
    setGame(gameCopy);
    setHistory((prev) => prev.slice(0, -1));
    setMoveFrom(null);
    setMoveTo(null);
    setOptionSquares({});
  };

  const getGameStatus = () => {
    if (game.isCheckmate()) return 'Checkmate! 🎉';
    if (game.isDraw()) return 'Draw! 🤝';
    if (game.isCheck()) return 'Check! ⚠️';
    return `${game.turn() === 'w' ? 'White' : 'Black'}'s turn`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-700">
          ♟️ Chess for Beginners
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Status Bar */}
          <div className="flex justify-between items-center mb-4 bg-purple-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-purple-800">
              {getGameStatus()}
            </div>
            <div className="text-sm text-gray-600">
              Move {Math.floor(history.length / 2) + 1}
            </div>
          </div>

          {/* Chess Board */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <Chessboard
                position={game.fen()}
                onSquareClick={onSquareClick}
                onSquareRightClick={onSquareRightClick}
                customSquareStyles={{
                  ...moveSquares,
                  ...optionSquares,
                  ...rightClickedSquares,
                }}
                promotionToSquare={moveTo}
                showPromotionDialog={showPromotionDialog}
                onPromotionPieceSelect={onPromotionPieceSelect}
                boardWidth={480}
                customBoardStyle={{
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}
                customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
              />
            </div>

            {/* Controls Sidebar */}
            <div className="lg:w-64 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">🎮 Controls</h3>
                <div className="space-y-2">
                  <button
                    onClick={undoMove}
                    disabled={history.length === 0}
                    className="w-full py-2 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                  >
                    ↩️ Undo Move
                  </button>
                  <button
                    onClick={resetGame}
                    className="w-full py-2 px-4 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition"
                  >
                    🔄 New Game
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">📜 Moves</h3>
                <div className="h-48 overflow-y-auto text-sm">
                  {history.length === 0 ? (
                    <p className="text-gray-400 italic">No moves yet...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      {history.map((move, i) => (
                        <div
                          key={i}
                          className={`p-1 rounded ${
                            i % 2 === 0 ? 'bg-white' : 'bg-purple-100'
                          }`}
                        >
                          {Math.floor(i / 2) + 1}.{i % 2 === 0 ? '' : '..'} {move}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-700 mb-2">💡 How to Play</h3>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Click a piece to see moves</li>
                  <li>• Click a highlighted square to move</li>
                  <li>• Right-click to mark squares</li>
                  <li>• Undo if you make a mistake!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}