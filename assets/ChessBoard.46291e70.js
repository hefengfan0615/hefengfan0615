var Ae = Object.defineProperty;
var xe = (i,e,t)=>e in i ? Ae(i, e, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: t
}) : i[e] = t;
var P = (i,e,t)=>(xe(i, typeof e != "symbol" ? e + "" : e, t),
t);
import {b as G, d as ye, e as Be, u as R, w as z, _ as we, o as Ne, c as be, f as Q, g as Ie, v as Ee} from "./index.b58f0dd0.js";
import {v as Z} from "./vschess.function.e5de4338.js";
function Oe(i, {volume: e=1, playbackRate: t=1, soundEnabled: s=!0, interrupt: o=!1, autoplay: n=!1, onload: l, ...r}={}) {
    const a = G(null)
      , c = G(!1)
      , h = G(null)
      , f = G(null);
    function d() {
        var M;
        typeof l == "function" && l.call(this),
        h.value = (h.value || ((M = f.value) == null ? void 0 : M.duration()) || 0) * 1e3,
        n === !0 && (c.value = !0)
    }
    return ye(async()=>{
        const M = await Be(()=>import("./howler.5cf60c4f.js").then(function(_) {
            return _.h
        }), ["assets/howler.5cf60c4f.js", "assets/index.b58f0dd0.js", "assets/index.65062099.css"]);
        a.value = M.default.Howl,
        f.value = new a.value({
            src: R(i),
            volume: R(e),
            rate: R(t),
            onload: d,
            ...r
        })
    }
    ),
    z(()=>[i], ()=>{
        a.value && a.value && f && f.value && (f.value = new a.value({
            src: R(i),
            volume: R(e),
            rate: R(t),
            onload: d,
            ...r
        }))
    }
    ),
    z(()=>[R(e), R(t)], ()=>{
        f.value && (f.value.volume(R(e)),
        f.value.rate(R(t)))
    }
    ),
    {
        play: M=>{
            typeof M == "undefined" && (M = {}),
            !(!f.value || !s && !M.forceSoundEnabled) && (o && f.value.stop(),
            M.playbackRate && f.value.rate(M.playbackRate),
            f.value.play(M.id),
            f.value.once("end", ()=>{
                f.value && f.value && !f.value.playing() && (c.value = !1)
            }
            ),
            c.value = !0)
        }
        ,
        sound: f,
        isPlaying: c,
        duration: h,
        pause: M=>{
            !f.value || (f.value.pause(typeof M == "number" ? M : void 0),
            c.value = !1)
        }
        ,
        stop: M=>{
            !f.value || (f.value.stop(typeof M == "number" ? M : void 0),
            c.value = !1)
        }
    }
}
var F = new Array;
F.w = new Array;
F.b = new Array;
F.w[0] = "\u8FDB";
F.w[1] = "\u9000";
F.b[0] = "\u9000";
F.b[1] = "\u8FDB";
F.p = "\u5E73";
var K = new Array;
K.w = new Array;
K.b = new Array;
K.w[0] = "\u524D";
K.w[1] = "\u540E";
K.b[0] = "\u540E";
K.b[1] = "\u524D";
K.m = "\u4E2D";
var O = new Array;
O.k = "\u5C06";
O.a = "\u58EB";
O.b = "\u8C61";
O.r = "\u8F66";
O.n = "\u9A6C";
O.c = "\u70AE";
O.p = "\u5352";
O.K = "\u5E05";
O.A = "\u4ED5";
O.B = "\u76F8";
O.R = "\u8F66";
O.N = "\u9A6C";
O.C = "\u70AE";
O.P = "\u5175";
var A = new Array;
A.w = new Array;
A.b = new Array;
A.w[0] = "\u4E00";
A.w[1] = "\u4E8C";
A.w[2] = "\u4E09";
A.w[3] = "\u56DB";
A.w[4] = "\u4E94";
A.w[5] = "\u516D";
A.w[6] = "\u4E03";
A.w[7] = "\u516B";
A.w[8] = "\u4E5D";
A.b[0] = "\uFF19";
A.b[1] = "\uFF18";
A.b[2] = "\uFF17";
A.b[3] = "\uFF16";
A.b[4] = "\uFF15";
A.b[5] = "\uFF14";
A.b[6] = "\uFF13";
A.b[7] = "\uFF12";
A.b[8] = "\uFF11";
const C = {
    NONE: 0,
    RED_KING: 1,
    RED_ROOK: 2,
    RED_KNIGHT: 3,
    RED_CANNON: 4,
    RED_BISHOP: 5,
    RED_ADVISOR: 6,
    RED_PAWN: 7,
    BLACK_KING: 9,
    BLACK_ROOK: 10,
    BLACK_KNIGHT: 11,
    BLACK_CANNON: 12,
    BLACK_BISHOP: 13,
    BLACK_ADVISOR: 14,
    BLACK_PAWN: 15
}
  , _e = {
    KING: 1,
    ROOK: 2,
    KNIGHT: 3,
    CANNON: 4,
    BISHOP: 5,
    ADVISOR: 6,
    PAWN: 7
}
  , le = {
    RED: 0,
    BLACK: 8
}
  , j = {
    "": C.NONE,
    r: C.BLACK_ROOK,
    n: C.BLACK_KNIGHT,
    b: C.BLACK_BISHOP,
    a: C.BLACK_ADVISOR,
    k: C.BLACK_KING,
    c: C.BLACK_CANNON,
    p: C.BLACK_PAWN,
    R: C.RED_ROOK,
    N: C.RED_KNIGHT,
    B: C.RED_BISHOP,
    A: C.RED_ADVISOR,
    K: C.RED_KING,
    C: C.RED_CANNON,
    P: C.RED_PAWN
}
  , q = {
    [C.NONE]: "",
    [C.BLACK_ROOK]: "r",
    [C.BLACK_KNIGHT]: "n",
    [C.BLACK_BISHOP]: "b",
    [C.BLACK_ADVISOR]: "a",
    [C.BLACK_KING]: "k",
    [C.BLACK_CANNON]: "c",
    [C.BLACK_PAWN]: "p",
    [C.RED_ROOK]: "R",
    [C.RED_KNIGHT]: "N",
    [C.RED_BISHOP]: "B",
    [C.RED_ADVISOR]: "A",
    [C.RED_KING]: "K",
    [C.RED_CANNON]: "C",
    [C.RED_PAWN]: "P"
}
  , Se = {
    INVALID: 0,
    NORMAL: 1,
    CAPTURE: 2,
    BLOCK: 3,
    CHECK: 4,
    CHECKMATE: 5,
    STALEMATE: 6,
    NO_RESPOND_TO_CHECK: 7,
    SUICIDE: 8
};
function Le(i) {
    let e = new Array;
    for (let n = 0; n < 9; n++) {
        e[n] = new Array;
        for (let l = 0; l < 10; l++)
            e[n][l] = 0
    }
    let t = i.split(" ")[0].split("/")
      , s = ["k", "a", "b", "r", "n", "c", "p", "K", "A", "B", "R", "N", "C", "P"]
      , o = 0;
    for (let n = 0; n < 10; n++) {
        let l = t[n]
          , r = 0;
        for (let a = 0; a < l.length; a++) {
            let c = l[a];
            if (c >= "0" && c <= "9")
                r += parseInt(c);
            else if (s.indexOf(c) != -1) {
                let h = c >= "a" && c <= "z" ? "b" : "w";
                e[r][n] = h + c + o,
                r++,
                o++
            }
        }
    }
    return e
}
function ne(i, e) {
    let t = Le(i);
    var s = e.charCodeAt(0) - 97
      , o = 9 - (e.charCodeAt(1) - 48)
      , n = e.charCodeAt(2) - 97
      , l = 9 - (e.charCodeAt(3) - 48)
      , r = 0
      , a = 0
      , c = 0
      , h = new String;
    if (t[s][o].charAt(1) != "A" && t[s][o].charAt(1) != "B" && t[s][o].charAt(1) != "a" && t[s][o].charAt(1) != "b") {
        for (var f = 0; f < 9; f++)
            if (f != s) {
                for (var d = 0; d < 10; d++)
                    t[f][d] != 0 && t[f][d].substr(0, 2) == t[s][o].substr(0, 2) && c++;
                c < 2 && (c = 0)
            }
        for (var d = 0; d < 10; d++)
            t[s][d] != 0 && t[s][d].substr(0, 2) == t[s][o].substr(0, 2) && (d < o ? c == 0 ? (h = K[t[s][o].charAt(0)][1] + O[t[s][o].charAt(1)],
            r++) : (h = K[t[s][o].charAt(0)][1] + A[t[s][o].charAt(0)][9 - s - 1],
            r++) : d == o ? r == 0 ? h = O[t[s][o].charAt(1)] + A[t[s][o].charAt(0)][9 - s - 1] : a = r : c == 0 ? r == 0 ? h = K[t[s][o].charAt(0)][0] + O[t[s][o].charAt(1)] : (h = K.m + O[t[s][o].charAt(1)],
            r++) : r == 0 ? h = K[t[s][o].charAt(0)][0] + A[t[s][o].charAt(0)][9 - s - 1] : (h = K.m + A[t[s][o].charAt(0)][9 - s - 1],
            r++));
        r > 2 && r != a && (t[s][o].charAt(0) == "w" ? h = A.w[a] + O[t[s][o].charAt(1)] : h = A.w[r - a] + O[t[s][o].charAt(1)])
    } else
        h = O[t[s][o].charAt(1)] + A[t[s][o].charAt(0)][9 - s - 1];
    var u = new String;
    return o > l ? s == n ? t[s][o].charAt(0) == "w" ? u = F[t[s][o].charAt(0)][0] + A[t[s][o].charAt(0)][o - l - 1] : u = F[t[s][o].charAt(0)][0] + A[t[s][o].charAt(0)][9 - (o - l - 1) - 1] : u = F[t[s][o].charAt(0)][0] + A[t[s][o].charAt(0)][9 - n - 1] : o == l ? u = F.p + A[t[s][o].charAt(0)][9 - n - 1] : s == n ? t[s][o].charAt(0) == "w" ? u = F[t[s][o].charAt(0)][1] + A[t[s][o].charAt(0)][l - o - 1] : u = F[t[s][o].charAt(0)][1] + A[t[s][o].charAt(0)][9 - (l - o - 1) - 1] : u = F[t[s][o].charAt(0)][1] + A[t[s][o].charAt(0)][9 - n - 1],
    h + u
}
function ke(i) {
    if (i == null || i.length === 0)
        return !1;
    let e = i.split(" ");
    if (e.length < 2)
        return !1;
    let t = e[0]
      , s = e[1];
    if (!"rwb".includes(s.toLowerCase()))
        return !1;
    let o = t.split("/");
    if (o.length !== 10)
        return !1;
    for (let n = 0; n < o.length; n++) {
        let l = o[n]
          , r = l.length
          , a = 0;
        for (let c = 0; c < r; c++) {
            let h = l.charAt(c);
            h >= "0" && h <= "9" ? a += parseInt(h) : a++
        }
        if (a !== 9)
            return !1
    }
    return !0
}
function Fe(i) {
    let e = ["a", "b", "c", "d", "e", "f", "g", "h", "i"]
      , t = i[0]
      , s = i[1]
      , o = e[t[0]] + (9 - t[1]).toString()
      , n = e[s[0]] + (9 - s[1]).toString();
    return o + n
}
function re(i) {
    let e = ["a", "b", "c", "d", "e", "f", "g", "h", "i"]
      , t = i.slice(0, 2)
      , s = i.slice(2, 4)
      , o = [e.indexOf(t[0]), 9 - parseInt(t[1])]
      , n = [e.indexOf(s[0]), 9 - parseInt(s[1])];
    return [o, n]
}
function ae(i, e) {
    let t = {};
    if (e === "zh-CN")
        return i;
    if (e === "zh-TW")
        t = {
            \u8FDB: "\u9032",
            \u9000: "\u9000",
            \u5E73: "\u5E73",
            \u524D: "\u524D",
            \u540E: "\u5F8C",
            \u4E2D: "\u4E2D",
            \u5C06: "\u5C07",
            \u5E05: "\u5E25",
            \u58EB: "\u58EB",
            \u4ED5: "\u4ED5",
            \u8C61: "\u8C61",
            \u76F8: "\u76F8",
            \u8F66: "\u8ECA",
            \u9A6C: "\u99AC",
            \u70AE: "\u70AE",
            \u5352: "\u5352",
            \u5175: "\u5175"
        };
    else if (e === "en-US")
        t = {
            \u8FDB: "+",
            \u9000: "-",
            \u5E73: "=",
            \u524D: "+",
            \u540E: "-",
            \u4E2D: "=",
            \u5C06: "k",
            \u5E05: "K",
            \u58EB: "a",
            \u4ED5: "A",
            \u8C61: "b",
            \u76F8: "B",
            \u8F66: "r",
            \u9A6C: "n",
            \u70AE: "c",
            \u5352: "p",
            \u5175: "P"
        };
    else if (e === "vi-VN")
        t = {
            \u8FDB: ".",
            \u9000: "/",
            \u5E73: "-",
            \u524D: ".",
            \u540E: "/",
            \u4E2D: "-",
            \u5C06: "Tg",
            \u5E05: "Tg",
            \u58EB: "S",
            \u4ED5: "S",
            \u8C61: "T",
            \u76F8: "T",
            \u8F66: "X",
            \u9A6C: "M",
            \u70AE: "P",
            \u5352: "B",
            \u5175: "B"
        };
    else
        return i;
    let s = "\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D"
      , o = "\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19"
      , n = "123456789"
      , l = ""
      , r = o.indexOf(i[3]) !== -1 ? "b" : "w";
    for (let a of i) {
        let c = s.indexOf(a)
          , h = o.indexOf(a);
        a in t ? l += t[a] : c !== -1 ? e !== "zh-TW" ? l += n[c] : l += a : h !== -1 && e !== "zh-TW" ? l += n[h] : l += a
    }
    return r === "w" ? l = l.toUpperCase() : l = l.toLowerCase(),
    l
}
function he() {
    return new Uint8Array(90)
}
function Ke(i) {
    return (i & le.BLACK) === 0 ? "w" : "b"
}
function Re(i) {
    return i & 7
}
function fe(i) {
    let t = i.split(" ")[0].split("/")
      , s = he()
      , o = "123456789".split("");
    for (let n in t) {
        let l = 0
          , r = t[n].split("");
        for (let a = 0; a < r.length; a++)
            j.hasOwnProperty(r[a]) ? (s[parseInt(n) * 9 + l] = j[r[a]],
            l++) : o.includes(r[a]) && (l += Number(r[a]))
    }
    return s
}
function ce(i, e="w") {
    let t = ""
      , s = 0;
    if (i == null)
        return "";
    for (let o = 0; o < 10; o++) {
        for (let n = 0; n < 9; n++) {
            let l = i[o * 9 + n];
            l === 0 ? s++ : (s > 0 && (t += s.toString(),
            s = 0),
            t += q[l])
        }
        s > 0 && (t += s.toString(),
        s = 0),
        t += "/"
    }
    return t = t.substring(0, t.length - 1) + " " + e,
    t
}
function De(i) {
    return i.split(" ")[1] === "b" ? "b" : "w"
}
function de(i) {
    return new Uint8Array(i)
}
function ue(i, e) {
    let t = de(i)
      , s = e[0]
      , o = e[1];
    return t[o[1] * 9 + o[0]] = t[s[1] * 9 + s[0]],
    t[s[1] * 9 + s[0]] = 0,
    t
}
function ge(i, e) {
    return ue(i, re(e))
}
function Ve(i, e, t) {
    let s = []
      , o = fe(i);
    for (let n = 0; n < e.length; n++) {
        let l = e[n]
          , r = ne(ce(o), l);
        s.push(ae(r, t)),
        o = ge(o, l)
    }
    return s
}
function He(i, e) {
    const t = []
      , s = []
      , o = [];
    let n = 0;
    const l = new Set
      , r = new Set;
    for (let h = 0; h < 90; h++) {
        const f = i[h]
          , d = e[h]
          , u = h % 9
          , v = Math.floor(h / 9);
        d !== f && (n += 1,
        d === C.NONE ? s.push({
            piece: f,
            x: u,
            y: v
        }) : (t.push({
            piece: d,
            x: u,
            y: v
        }),
        f !== C.NONE && s.push({
            piece: f,
            x: u,
            y: v
        })))
    }
    s.forEach((h,f)=>{
        const d = t.findIndex(u=>u.piece === h.piece);
        if (d !== -1) {
            const u = t[d];
            o.push({
                piece: u.piece,
                fromX: h.x,
                fromY: h.y,
                toX: u.x,
                toY: u.y
            }),
            l.add(d),
            r.add(f)
        }
    }
    );
    const a = t.filter((h,f)=>!l.has(f))
      , c = s.filter((h,f)=>!r.has(f));
    return {
        newPieces: a,
        removedPieces: c,
        movedPieces: o,
        diffCount: n
    }
}
function Ue(i) {
    let e = "";
    for (let t = 0; t < 10; t++) {
        for (let s = 0; s < 9; s++)
            i[t * 9 + s] === C.NONE ? e += "+ " : e += q[i[t * 9 + s]] + " ";
        e += `
`
    }
    return e
}
var p = {
    name: "XiangqiUtils",
    ChessPiece: C,
    ChessPieceType: _e,
    ChessPieceSide: le,
    CharToPieceMap: j,
    PieceToCharMap: q,
    MoveType: Se,
    getEmptyBoard: he,
    getChineseMoveName: ne,
    ValidateFen: ke,
    moveCordToUciMove: Fe,
    translateMoveName: ae,
    uciMoveToMoveCord: re,
    fenToBoard: fe,
    getSide: Ke,
    getType: Re,
    fenToTurn: De,
    makeMove: ue,
    makeMoveByUci: ge,
    boardToFen: ce,
    fastCopyBoard: de,
    getSerialLocalMoveNameList: Ve,
    getBoardDiff: He,
    getBoardString: Ue
};
function We() {
    var i = new Date
      , e = i.getFullYear() + "-"
      , t = (i.getMonth() + 1 < 10 ? "0" + (i.getMonth() + 1) : i.getMonth() + 1) + "-"
      , s = (i.getDate() < 10 ? "0" + i.getDate() : i.getDate()) + " "
      , o = (i.getHours() < 10 ? "0" + i.getHours() : i.getHours()) + ":"
      , n = (i.getMinutes() < 10 ? "0" + i.getMinutes() : i.getMinutes()) + ":"
      , l = i.getSeconds() < 10 ? "0" + i.getSeconds() : i.getSeconds();
    return e + t + s + o + n + l
}
function Ge(i) {
    let e = 0;
    for (; e < i.length; ) {
        if (i[e] === 9 || i[e] === 10 || i[e] === 13 || 32 <= i[e] && i[e] <= 126) {
            e += 1;
            continue
        }
        if (194 <= i[e] && i[e] <= 223 && 128 <= i[e + 1] && i[e + 1] <= 191) {
            e += 2;
            continue
        }
        if (i[e] === 224 && 160 <= i[e + 1] && i[e + 1] <= 191 && 128 <= i[e + 2] && i[e + 2] <= 191 || (225 <= i[e] && i[e] <= 236 || i[e] === 238 || i[e] === 239) && 128 <= i[e + 1] && i[e + 1] <= 191 && 128 <= i[e + 2] && i[e + 2] <= 191 || i[e] === 237 && 128 <= i[e + 1] && i[e + 1] <= 159 && 128 <= i[e + 2] && i[e + 2] <= 191) {
            e += 3;
            continue
        }
        if (i[e] === 240 && 144 <= i[e + 1] && i[e + 1] <= 191 && 128 <= i[e + 2] && i[e + 2] <= 191 && 128 <= i[e + 3] && i[e + 3] <= 191 || 241 <= i[e] && i[e] <= 243 && 128 <= i[e + 1] && i[e + 1] <= 191 && 128 <= i[e + 2] && i[e + 2] <= 191 && 128 <= i[e + 3] && i[e + 3] <= 191 || i[e] === 244 && 128 <= i[e + 1] && i[e + 1] <= 143 && 128 <= i[e + 2] && i[e + 2] <= 191 && 128 <= i[e + 3] && i[e + 3] <= 191) {
            e += 4;
            continue
        }
        return !1
    }
    return !0
}
function Xe(i) {
    return new Promise((e,t)=>{
        const s = new FileReader;
        s.onload = function(o) {
            const n = new Uint8Array(o.target.result)
              , l = Ge(n) ? "utf-8" : "gb2312"
              , r = new TextDecoder(l).decode(n);
            console.log(`Detected encoding: ${l}`),
            e(r)
        }
        ,
        s.onerror = function(o) {
            console.error("File could not be read: " + o.target.error.code),
            t(o.target.error)
        }
        ,
        s.readAsArrayBuffer(i)
    }
    )
}
function $e(i) {
    return new Promise((e,t)=>{
        const s = new FileReader;
        s.onload = ()=>{
            const o = s.result;
            e({
                content: o,
                type: "binary"
            })
        }
        ,
        s.onerror = o=>{
            t(o)
        }
        ,
        s.readAsArrayBuffer(i)
    }
    )
}
function Ye(i) {
    let e = ""
      , t = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let s = 0; s < i; s++)
        e += t.charAt(Math.floor(Math.random() * t.length));
    return e
}
var pe = {
    name: "Utils",
    getTimeStr: We,
    readBinary: $e,
    readTextFile: Xe,
    getRandomId: Ye
};
class W {
    constructor({board: e=null, fen: t="", move: s="", comment: o="", next: n=[], defaultIndex: l=0, moveId: r="", side: a="", moveCord: c=null, isCapture: h=!1}, f=null) {
        this.board = e,
        this.fen = t,
        this.move = s,
        this.comment = o,
        this.next = [],
        this.defaultIndex = l,
        this.moveId = r,
        this.side = a,
        this.moveCord = c,
        this.isCapture = h,
        this.parent = f,
        this.scoreInfo = null,
        this.completeData()
    }
    completeData() {
        if (this.moveId.length === 0 && this.move.length !== 0 && (this.moveId = pe.getRandomId(8)),
        (!this.moveCord || this.moveCord.length === 0 && this.move.length !== 0) && (this.moveCord = p.uciMoveToMoveCord(this.move)),
        this.board === null && this.fen != null && this.fen.length !== 0 && (this.board = p.fenToBoard(this.fen),
        this.side = p.getSide(this.fen)),
        this.fen.length === 0 && this.move.length !== 0 && this.parent != null) {
            let e = [];
            this.parent.board != null ? e = this.parent.board : e = p.fenToBoard(this.parent.fen);
            let t = this.moveCord[0]
              , s = this.moveCord[1];
            e[s[1] * 9 + s[0]] !== 0 && (this.isCapture = !0);
            let o = p.getSide(e[t[1] * 9 + t[0]])
              , n = p.makeMove(e, this.moveCord);
            this.side = o,
            this.board = n
        }
    }
    getFen() {
        return this.fen != null && this.fen.length > 0 ? this.fen : this.board != null ? (this.fen = p.boardToFen(this.board, this.side === "b" ? "w" : "b"),
        this.fen) : null
    }
    isMoveExists(e) {
        return this.getChildByUciMove(e) != null
    }
    getChildByUciMove(e) {
        for (let t of this.next)
            if (t.move === e)
                return t;
        return null
    }
    getChildByMoveId(e) {
        for (let t of this.next)
            if (t.moveId === e)
                return t;
        return null
    }
    addChild(e) {
        return e.parent = this,
        this.next.push(e),
        e
    }
    getRoot() {
        let e = this;
        for (; e.parent; )
            e = e.parent;
        return e
    }
    getPrev() {
        return this.parent == null ? this : this.parent
    }
    getNext() {
        if (this.next.length === 0)
            return this;
        let e = this.defaultIndex < this.next.length ? this.defaultIndex : 0;
        return this.next[e]
    }
    getSiblings() {
        return this.parent ? this.parent.next : [this]
    }
    getSiblingsWithoutSelf() {
        return this.getSiblings().filter(t=>t !== this)
    }
    getLeaf() {
        let e = this;
        for (; e.next != null && e.next.length > 0; ) {
            let t = e.defaultIndex < e.next.length ? e.defaultIndex : 0;
            e = e.next[t]
        }
        return e
    }
    findNodeByMoveId(e, t) {
        if (e.moveId === t)
            return e;
        for (let s of e.next) {
            let o = this.findNodeByMoveId(s, t);
            if (o != null)
                return o
        }
        return null
    }
    findNodeByFenAndMove(e, t, s) {
        if (e.getFen().split(" ")[0] === t.split(" ")[0] && e.move === s)
            return e;
        for (let o of e.next) {
            let n = this.findNodeByFenAndMove(o, t, s);
            if (n != null)
                return n
        }
        return null
    }
    countNodes() {
        let e = 1;
        for (let t of this.next)
            e += t.countNodes();
        return e
    }
    countNodesWithComment() {
        let e = this.comment.length > 0 ? 1 : 0;
        for (let t of this.next)
            e += t.countNodesWithComment();
        return e
    }
    countVariants() {
        let e = this.next.length > 1 ? 1 : 0;
        for (let t of this.next)
            e += t.countVariants();
        return e
    }
    getMoveName() {
        return this.parent == null ? "" : p.getChineseMoveName(this.parent.fen, this.move)
    }
    adjustMoveRank(e, t=1) {
        let s = this.getSiblings()
          , o = this.parent.defaultIndex
          , n = this.parent.next[o]
          , l = s.findIndex(c=>c.moveId === e)
          , r = l + t;
        r < 0 ? r = 0 : r >= s.length && (r = s.length - 1);
        let a = s[l];
        s.splice(l, 1),
        s.splice(r, 0, a),
        this.parent.defaultIndex = s.findIndex(c=>c.moveId === n.moveId),
        this.parent.next = s
    }
    serialize() {
        let e = me(this.getRoot());
        return Z.nodeToData_DhtmlXQ(e)
    }
    static deserialize(e) {
        let t = Z.dataToNode_DhtmlXQ(e);
        return ve(t)
    }
}
function ve(i, e=null) {
    let t = new W(i,e);
    for (let s of i.next) {
        let o = ve(s, t);
        t.addChild(o)
    }
    return t
}
function me(i, e=null) {
    e == null && (e = i);
    let t = {
        comment: i.comment,
        next: [],
        defaultIndex: i.defaultIndex
    };
    e === i && i.getFen() != null && i.getFen().length > 0 && (t.fen = i.getFen()),
    i.move != null && i.move.length > 0 && (t.move = i.move);
    for (let s of i.next) {
        let o = me(s, e);
        t.next.push(o)
    }
    return t
}
const I = p.ChessPiece
  , D = p.ChessPieceType
  , g = p.MoveType;
class je {
    constructor(e="rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w") {
        P(this, "newGame", (e="rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w")=>{
            this.parseFen(e),
            this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
        }
        );
        P(this, "makeMove", (e,t)=>{
            let s = new Uint8Array(this.moveTree.board);
            if (s[e[1] * 9 + e[0]] === I.NONE)
                throw new Error("No piece at from position");
            let o = this.getMoveType(s, [e, t]);
            this.lastMove = [e, t];
            let n = pe.getRandomId(8)
              , l = !1;
            s[t[1] * 9 + t[0]] !== I.NONE && (l = !0);
            let r = p.getSide(this.getPiece(s, e))
              , a = r === "w" ? "b" : "w";
            s[t[1] * 9 + t[0]] = s[e[1] * 9 + e[0]],
            s[e[1] * 9 + e[0]] = I.NONE;
            let c = p.moveCordToUciMove([e, t])
              , h = {
                moveId: n,
                board: s,
                side: r,
                moveCord: [e, t],
                move: c,
                isCapture: l,
                moveType: o
            }
              , f = this.moveTree.getChildByUciMove(c);
            return f == null ? this.moveTree = this.moveTree.addChild(new W(h,this.moveTree)) : this.moveTree = f,
            this.moveTree.parent != null && (this.moveTree.parent.defaultIndex = this.moveTree.parent.next.indexOf(this.moveTree)),
            this.board = s,
            this.turn = a,
            this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree, !0),
            h
        }
        );
        P(this, "getMoveType", (e,t)=>{
            let s = t[0]
              , o = t[1]
              , n = e[s[1] * 9 + s[0]]
              , l = e[o[1] * 9 + o[0]]
              , r = null;
            if (n === I.NONE)
                return g.INVALID;
            l === I.NONE ? r = g.NORMAL : r = g.CAPTURE;
            let a = p.getSide(n)
              , c = a === "b" ? "w" : "b"
              , h = p.makeMove(e, t);
            return this.isInCheck(h, a) ? this.isInCheck(e, a) ? g.NO_RESPOND_TO_CHECK : g.SUICIDE : (this.isInCheck(h, c) && (r = g.CHECK,
            this.isCheckmated(h, c) && (r = g.CHECKMATE)),
            this.isStalemated(h, c) && (r = g.STALEMATE),
            r)
        }
        );
        P(this, "isPositionValid", e=>{
            this.turn;
            let t = this.turn === "b" ? "w" : "b";
            return !(this.isInCheck(e, t) || !this.isKingPosValid(e))
        }
        );
        P(this, "isKingPosValid", e=>{
            let t = 0
              , s = 0
              , o = 0;
            for (let n = 3; n < 6; n++) {
                for (let l = 0; l < 3; l++)
                    e[l * 9 + n] === I.BLACK_KING && (s += 1);
                for (let l = 7; l < 10; l++)
                    e[l * 9 + n] === I.RED_KING && (t += 1)
            }
            for (let n = 0; n < 90; n++)
                p.getType(e[n]) === D.KING && (o += 1);
            return t === 1 && s === 1 && o === 2
        }
        );
        P(this, "isInCheck", (e,t)=>{
            let s = this.getAllPossibleMoveCords(e, t === "b" ? "w" : "b");
            for (let o of s) {
                let n = this.getPiece(e, o[1]);
                if (p.getType(n) === D.KING)
                    return !0
            }
            return !1
        }
        );
        P(this, "isCheckmated", (e,t)=>{
            if (!this.isInCheck(e, t))
                return !1;
            let s = this.getAllPossibleMoveCords(e, t);
            for (let o of s) {
                let n = p.makeMove(e, o);
                if (!this.isInCheck(n, t))
                    return !1
            }
            return !0
        }
        );
        P(this, "isStalemated", (e,t)=>{
            let s = this.getAllPossibleMoveCords(e, t);
            for (let o of s) {
                let n = p.makeMove(e, o);
                if (!this.isInCheck(n, t))
                    return !1
            }
            return !0
        }
        );
        P(this, "parseFen", e=>{
            let t = e.split(" ");
            if (this.board = p.fenToBoard(t[0]),
            this.turn = p.fenToTurn(e),
            this.moveTree = new W({
                board: this.board,
                side: this.turn === "b" ? "w" : "b"
            }),
            this.lastMove = null,
            e.indexOf("moves") > -1) {
                let s = e.split("moves")[1].trim()
                  , o = s.split(" ");
                if (o.length > 0 && o[0].length === 4)
                    for (let n of o)
                        this.makeMoveByString(n);
                else
                    for (let n = 0; n < s.length; n += 4)
                        this.makeMoveByString(s.substring(n, n + 4))
            }
        }
        );
        P(this, "gotoHistory", e=>{
            this.gotoHistoryByMoveId(e.moveId)
        }
        );
        P(this, "gotoHistoryByMoveId", e=>{
            let t = this.moveTree.getLeaf();
            for (let s = t; s != null; s = s.parent)
                if (s.moveId === e) {
                    this.moveTree = s;
                    break
                } else {
                    let o = !1;
                    if (s.getSiblings().length > 1 && (s.getSiblings().forEach(l=>{
                        l.moveId === e && (this.moveTree = l,
                        o = !0)
                    }
                    ),
                    o))
                        break
                }
            this.moveTree.parent != null && (this.moveTree.parent.defaultIndex = this.moveTree.parent.next.indexOf(this.moveTree)),
            this.lastMove = this.moveTree.moveCord,
            this.turn = this.moveTree.side === "w" ? "b" : "w",
            this.board = p.fenToBoard(this.moveTree.getFen()),
            this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
        }
        );
        P(this, "findSiblingByMoveId", e=>{
            let t = this.moveTree.getSiblings();
            for (let s of t)
                if (s.moveId === e)
                    return s;
            return null
        }
        );
        P(this, "gotoSibling", (e=1)=>{
            let t = this.moveTree.getSiblings();
            if (t.length > 0) {
                let s = this.moveTree.parent.defaultIndex + e;
                s >= t.length && (s = 0),
                s < 0 && (s = t.length - 1),
                this.moveTree.parent.defaultIndex = s,
                this.moveTree = t[s],
                this.lastMove = this.moveTree.moveCord,
                this.board = p.fenToBoard(this.moveTree.getFen()),
                this.turn = p.fenToTurn(this.moveTree.getFen()),
                this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
            }
        }
        );
        P(this, "restoreHistory", ()=>{
            this.moveTree = this.moveTree.getLeaf(),
            this.lastMove = this.moveTree.moveCord,
            this.board = p.fenToBoard(this.moveTree.getFen()),
            this.turn = p.fenToTurn(this.moveTree.getFen()),
            this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
        }
        );
        P(this, "deleteMove", e=>{
            if (e == null)
                return;
            let t = e.getSiblings()
              , s = e.parent;
            if (this.moveTree === e)
                if (t.length > 0) {
                    for (let o of t)
                        if (o.moveId !== e.moveId) {
                            this.moveTree = o;
                            break
                        }
                } else
                    this.moveTree = s;
            s.next = t.filter(o=>o.moveId !== e.moveId),
            s.defaultIndex >= s.next.length && (s.defaultIndex = s.next.length - 1),
            this.lastMove = this.moveTree.moveCord,
            this.board = p.fenToBoard(this.moveTree.getFen()),
            this.turn = p.fenToTurn(this.moveTree.getFen()),
            this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
        }
        );
        P(this, "getValidType", (e,t,s)=>{
            let o = this.getPiece(e, s);
            return o === void 0 ? g.INVALID : o === I.NONE ? g.NORMAL : t !== p.getSide(o) ? g.CAPTURE : g.BLOCK
        }
        );
        P(this, "getValidMoveMap", (e,t)=>{
            let s = this.getPiece(e, t)
              , o = p.getSide(s)
              , n = p.getType(s);
            return n === D.ROOK ? this.getValidMoveMapRooks(e, o, t) : n === D.KNIGHT ? this.getValidMoveMapKnights(e, o, t) : n === D.ADVISOR ? this.getValidMoveMapAdvisors(e, o, t) : n === D.BISHOP ? this.getValidMoveMapBishops(e, o, t) : n === D.KING ? this.getValidMoveMapKings(e, o, t) : n === D.CANNON ? this.getValidMoveMapCannons(e, o, t) : n === D.PAWN ? this.getValidMoveMapPawns(e, o, t) : p.getEmptyBoard()
        }
        );
        P(this, "getValidMoveMapRooks", (e,t,s)=>{
            let o = p.getEmptyBoard()
              , n = s[0]
              , l = s[1];
            for (let r = n; r < 9; r++) {
                if (r === n)
                    continue;
                let a = this.getValidType(e, t, [r, l]);
                if (a === g.BLOCK || (o[l * 9 + r] = a,
                a === g.CAPTURE))
                    break
            }
            for (let r = n; r >= 0; r--) {
                if (r === n)
                    continue;
                let a = this.getValidType(e, t, [r, l]);
                if (a === g.BLOCK || (o[l * 9 + r] = a,
                a === g.CAPTURE))
                    break
            }
            for (let r = l; r < 10; r++) {
                if (r === l)
                    continue;
                let a = this.getValidType(e, t, [n, r]);
                if (a === g.BLOCK || (o[r * 9 + n] = a,
                a === g.CAPTURE))
                    break
            }
            for (let r = l; r >= 0; r--) {
                if (r === l)
                    continue;
                let a = this.getValidType(e, t, [n, r]);
                if (a === g.BLOCK || (o[r * 9 + n] = a,
                a === g.CAPTURE))
                    break
            }
            return o
        }
        );
        P(this, "getValidMoveMapKnights", (e,t,s)=>{
            let o = p.getEmptyBoard()
              , n = s[0]
              , l = s[1];
            return this.getPiece(e, [n + 1, l]) === I.NONE && (this.setMoveMap(o, [n + 2, l + 1], this.getValidType(e, t, [n + 2, l + 1])),
            this.setMoveMap(o, [n + 2, l - 1], this.getValidType(e, t, [n + 2, l - 1]))),
            this.getPiece(e, [n - 1, l]) === I.NONE && (this.setMoveMap(o, [n - 2, l + 1], this.getValidType(e, t, [n - 2, l + 1])),
            this.setMoveMap(o, [n - 2, l - 1], this.getValidType(e, t, [n - 2, l - 1]))),
            this.getPiece(e, [n, l + 1]) === I.NONE && (this.setMoveMap(o, [n + 1, l + 2], this.getValidType(e, t, [n + 1, l + 2])),
            this.setMoveMap(o, [n - 1, l + 2], this.getValidType(e, t, [n - 1, l + 2]))),
            this.getPiece(e, [n, l - 1]) === I.NONE && (this.setMoveMap(o, [n + 1, l - 2], this.getValidType(e, t, [n + 1, l - 2])),
            this.setMoveMap(o, [n - 1, l - 2], this.getValidType(e, t, [n - 1, l - 2]))),
            o
        }
        );
        P(this, "getValidMoveMapAdvisors", (e,t,s)=>{
            let o = p.getEmptyBoard(), n = s[0], l = s[1], r, a;
            l <= 2 ? (r = 0,
            a = 2) : l >= 7 ? (r = 7,
            a = 9) : (r = l - 1,
            a = l + 1);
            let c = 3
              , h = 5;
            if (n + 1 <= h && l + 1 <= a) {
                let f = this.getValidType(e, t, [n + 1, l + 1]);
                (f === g.CAPTURE || f === g.NORMAL) && this.setMoveMap(o, [n + 1, l + 1], f)
            }
            if (n - 1 >= c && l + 1 <= a) {
                let f = this.getValidType(e, t, [n - 1, l + 1]);
                (f === g.CAPTURE || f === g.NORMAL) && this.setMoveMap(o, [n - 1, l + 1], f)
            }
            if (n + 1 <= h && l - 1 >= r) {
                let f = this.getValidType(e, t, [n + 1, l - 1]);
                (f === g.CAPTURE || f === g.NORMAL) && this.setMoveMap(o, [n + 1, l - 1], f)
            }
            if (n - 1 >= c && l - 1 >= r) {
                let f = this.getValidType(e, t, [n - 1, l - 1]);
                (f === g.CAPTURE || f === g.NORMAL) && this.setMoveMap(o, [n - 1, l - 1], f)
            }
            return o
        }
        );
        P(this, "getValidMoveMapBishops", (e,t,s)=>{
            let o = p.getEmptyBoard(), n = s[0], l = s[1], r, a;
            if (l <= 4 ? (r = 0,
            a = 4) : l >= 5 ? (r = 5,
            a = 9) : (r = l - 1,
            a = l + 1),
            n + 2 <= 9 && l + 2 <= a && this.getPiece(e, [n + 1, l + 1]) === I.NONE) {
                let h = this.getValidType(e, t, [n + 2, l + 2]);
                (h === g.CAPTURE || h === g.NORMAL) && this.setMoveMap(o, [n + 2, l + 2], h)
            }
            if (n - 2 >= 0 && l + 2 <= a && this.getPiece(e, [n - 1, l + 1]) === I.NONE) {
                let h = this.getValidType(e, t, [n - 2, l + 2]);
                (h === g.CAPTURE || h === g.NORMAL) && this.setMoveMap(o, [n - 2, l + 2], h)
            }
            if (n + 2 <= 9 && l - 2 >= r && this.getPiece(e, [n + 1, l - 1]) === I.NONE) {
                let h = this.getValidType(e, t, [n + 2, l - 2]);
                (h === g.CAPTURE || h === g.NORMAL) && this.setMoveMap(o, [n + 2, l - 2], h)
            }
            if (n - 2 >= 0 && l - 2 >= r && this.getPiece(e, [n - 1, l - 1]) === I.NONE) {
                let h = this.getValidType(e, t, [n - 2, l - 2]);
                (h === g.CAPTURE || h === g.NORMAL) && this.setMoveMap(o, [n - 2, l - 2], h)
            }
            return o
        }
        );
        P(this, "getValidMoveMapKings", (e,t,s)=>{
            let o = p.getEmptyBoard(), n = s[0], l = s[1], r, a;
            l <= 2 ? (r = 0,
            a = 2) : l >= 7 ? (r = 7,
            a = 9) : (r = l - 1,
            a = l + 1);
            let c = 3
              , h = 5;
            if (n + 1 <= h) {
                let u = this.getValidType(e, t, [n + 1, l]);
                (u === g.CAPTURE || u === g.NORMAL) && this.setMoveMap(o, [n + 1, l], u)
            }
            if (n - 1 >= c) {
                let u = this.getValidType(e, t, [n - 1, l]);
                (u === g.CAPTURE || u === g.NORMAL) && this.setMoveMap(o, [n - 1, l], u)
            }
            if (l + 1 <= a) {
                let u = this.getValidType(e, t, [n, l + 1]);
                (u === g.CAPTURE || u === g.NORMAL) && this.setMoveMap(o, [n, l + 1], u)
            }
            if (l - 1 >= r) {
                let u = this.getValidType(e, t, [n, l - 1]);
                (u === g.CAPTURE || u === g.NORMAL) && this.setMoveMap(o, [n, l - 1], u)
            }
            let f = 0
              , d = null;
            for (let u = 0; u < 10; u++) {
                if (u === l)
                    continue;
                let v = this.getPiece(e, [n, u]);
                p.getType(v) === D.KING && (d = [n, u])
            }
            if (d != null) {
                let u = d[1] < l ? d[1] : l
                  , v = d[1] < l ? l : d[1];
                for (let m = u + 1; m < v; m++)
                    this.getPiece(e, [n, m]) !== I.NONE && (f += 1);
                f === 0 && this.setMoveMap(o, d, g.CAPTURE)
            }
            return o
        }
        );
        P(this, "getValidMoveMapCannons", (e,t,s)=>{
            let o = p.getEmptyBoard()
              , n = s[0]
              , l = s[1]
              , r = 0;
            for (let a = n; a < 9; a++) {
                if (a === n)
                    continue;
                let c = this.getValidType(e, t, [a, l]);
                if (r === 1 && c === g.CAPTURE) {
                    this.setMoveMap(o, [a, l], g.CAPTURE);
                    break
                } else
                    r === 0 && c === g.NORMAL && this.setMoveMap(o, [a, l], g.NORMAL);
                (c === g.BLOCK || c === g.CAPTURE) && (r += 1)
            }
            r = 0;
            for (let a = n; a >= 0; a--) {
                if (a === n)
                    continue;
                let c = this.getValidType(e, t, [a, l]);
                if (r === 1 && c === g.CAPTURE) {
                    this.setMoveMap(o, [a, l], g.CAPTURE);
                    break
                } else
                    r === 0 && c === g.NORMAL && this.setMoveMap(o, [a, l], g.NORMAL);
                (c === g.BLOCK || c === g.CAPTURE) && (r += 1)
            }
            r = 0;
            for (let a = l; a < 10; a++) {
                if (a === l)
                    continue;
                let c = this.getValidType(e, t, [n, a]);
                if (r === 1 && c === g.CAPTURE) {
                    this.setMoveMap(o, [n, a], g.CAPTURE);
                    break
                } else
                    r === 0 && c === g.NORMAL && this.setMoveMap(o, [n, a], g.NORMAL);
                (c === g.BLOCK || c === g.CAPTURE) && (r += 1)
            }
            r = 0;
            for (let a = l; a >= 0; a--) {
                if (a === l)
                    continue;
                let c = this.getValidType(e, t, [n, a]);
                if (r === 1 && c === g.CAPTURE) {
                    this.setMoveMap(o, [n, a], g.CAPTURE);
                    break
                } else
                    r === 0 && c === g.NORMAL && this.setMoveMap(o, [n, a], g.NORMAL);
                (c === g.BLOCK || c === g.CAPTURE) && (r += 1)
            }
            return o
        }
        );
        P(this, "getValidMoveMapPawns", (e,t,s)=>{
            let o = p.getEmptyBoard()
              , n = s[0]
              , l = s[1]
              , r = this.getSideByKing(e, s);
            if (t === r)
                if (l <= 4) {
                    let a = this.getValidType(e, t, [n, l + 1]);
                    (a === g.CAPTURE || a === g.NORMAL) && this.setMoveMap(o, [n, l + 1], a)
                } else {
                    let a = this.getValidType(e, t, [n, l - 1]);
                    (a === g.CAPTURE || a === g.NORMAL) && this.setMoveMap(o, [n, l - 1], a)
                }
            else {
                if (l <= 4) {
                    let c = this.getValidType(e, t, [n, l - 1]);
                    (c === g.CAPTURE || c === g.NORMAL) && this.setMoveMap(o, [n, l - 1], c)
                } else {
                    let c = this.getValidType(e, t, [n, l + 1]);
                    (c === g.CAPTURE || c === g.NORMAL) && this.setMoveMap(o, [n, l + 1], c)
                }
                let a = this.getValidType(e, t, [n + 1, l]);
                (a === g.CAPTURE || a === g.NORMAL) && this.setMoveMap(o, [n + 1, l], a),
                a = this.getValidType(e, t, [n - 1, l]),
                (a === g.CAPTURE || a === g.NORMAL) && this.setMoveMap(o, [n - 1, l], a)
            }
            return o
        }
        );
        P(this, "getSideByKing", (e,t)=>{
            t[0];
            let s = t[1]
              , o = 0
              , n = 2;
            s > 4 && (o = 7,
            n = 9);
            for (let l = 3; l <= 5; l++)
                for (let r = o; r <= n; r++) {
                    let a = this.getPiece(e, [l, r]);
                    if (a === I.RED_KING)
                        return "w";
                    if (a === I.BLACK_KING)
                        return "b"
                }
            return ""
        }
        );
        P(this, "getSideByMoveString", e=>{
            let s = this.moveStringToPos(e)[0];
            return p.getSide(this.getPiece(this.board, s))
        }
        );
        P(this, "makeMoveByString", e=>this.makeMove(...this.moveStringToPos(e)));
        P(this, "moveStringToPos", e=>{
            let t = {
                a: 0,
                b: 1,
                c: 2,
                d: 3,
                e: 4,
                f: 5,
                g: 6,
                h: 7,
                i: 8
            }
              , s = {
                0: 9,
                1: 8,
                2: 7,
                3: 6,
                4: 5,
                5: 4,
                6: 3,
                7: 2,
                8: 1,
                9: 0
            }
              , o = [t[e[0]], s[e[1]]]
              , n = [t[e[2]], s[e[3]]];
            return [o, n]
        }
        );
        P(this, "getPiece", (e,t)=>t == null ? I.NONE : e[t[1] * 9 + t[0]]);
        P(this, "resetMoveList", ()=>{
            this.moveTree = new W({
                fen: p.boardToFen(this.board, this.turn)
            }),
            this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
        }
        );
        P(this, "removePiece", e=>{
            this.setPiece(e, I.NONE),
            this.resetMoveList()
        }
        );
        P(this, "setPiece", (e,t)=>{
            this.board[e[1] * 9 + e[0]] = t,
            this.resetMoveList()
        }
        );
        P(this, "movePiece", (e,t)=>{
            this.board[t[1] * 9 + t[0]] = this.board[e[1] * 9 + e[0]],
            this.board[e[1] * 9 + e[0]] = I.NONE,
            this.resetMoveList()
        }
        );
        P(this, "setMoveMap", (e,t,s)=>{
            t[0] < 0 || t[0] > 8 || t[1] < 0 || t[1] > 9 || (e[t[1] * 9 + t[0]] = s)
        }
        );
        P(this, "initBoard", ()=>{
            this.fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w",
            p.fenToBoard(this.fen)
        }
        );
        P(this, "getFen", ()=>p.boardToFen(this.board, this.turn));
        P(this, "getFenWithMove", ()=>{
            let e = []
              , t = this.moveTree.getRoot();
            for (let n = this.moveTree; n.parent != null; n = n.parent) {
                if (n.isCapture) {
                    t = n;
                    break
                }
                e.unshift(this.createMoveObject(n))
            }
            let s = [];
            for (let n of e)
                s.push(n.move);
            let o = t.getFen();
            return s.length > 0 && (o += " moves " + s.join(" ")),
            o
        }
        );
        P(this, "getFenWithFullMove", (e=" ")=>{
            let t = this.getFullMoveList()
              , s = this.moveTree.getRoot().getFen();
            return t.length > 0 && (s += " moves " + t.join(e)),
            s
        }
        );
        P(this, "getFullMoveList", ()=>{
            let e = this.getMoveList()
              , t = [];
            for (let s of e)
                t.push(s.move);
            return t
        }
        );
        this.language = "zh-CN",
        this.board = null,
        this.turn = null,
        this.lastMove = null,
        this.moveTree = null,
        this.newGame(e),
        this.onMoveTreeChange = null
    }
    deserialize(e, t) {
        try {
            if (e == null || e.length === 0)
                return;
            e = JSON.parse(e);
            let s = JSON.parse(t);
            if (s.fen != null && s.fen.length > 0 && (this.fen = s.fen),
            this.board = p.fenToBoard(this.fen),
            e.moveTree != null && s.fen != null && s.move != null) {
                this.moveTree = W.deserialize(e.moveTree);
                let o = this.moveTree.findNodeByFenAndMove(this.moveTree, s.fen, s.move);
                o != null && (this.moveTree = o)
            }
            this.turn = p.fenToTurn(this.fen),
            this.lastMove = p.uciMoveToMoveCord(s.move)
        } catch {
            this.newGame()
        }
        this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
    }
    serializeMoveTree() {
        return JSON.stringify({
            moveTree: this.moveTree.getRoot().serialize()
        })
    }
    serializeMoveTreePtr() {
        return JSON.stringify({
            fen: this.moveTree.getFen(),
            move: this.moveTree.move
        })
    }
    createMoveObject(e) {
        let t = null;
        return e.parent != null && e.parent.next.length > 1 && (t = {
            index: e.parent.next.indexOf(e),
            total: e.parent.next.length
        }),
        {
            moveId: e.moveId,
            fen: e.getFen(),
            side: e.side,
            moveCord: e.moveCord,
            move: e.move,
            isCapture: e.isCapture,
            variantInfo: t,
            scoreInfo: e.scoreInfo,
            comment: e.comment
        }
    }
    getMoveListByTree(e, t=!0) {
        let s = [];
        for (let o = e; o != null; o = o.parent)
            s.unshift(this.createMoveObject(o));
        for (let o = e; o.next != null && o.next.length > 0; ) {
            let n = o.defaultIndex < o.next.length ? o.defaultIndex : 0;
            o = o.next[n],
            o !== e && s.push(this.createMoveObject(o))
        }
        if (t)
            for (let o = 1; o < s.length; o++) {
                let n = p.getChineseMoveName(s[o - 1].fen, s[o].move);
                s[o].chn_move_name = p.translateMoveName(n, this.language)
            }
        return s = s.slice(1, s.length),
        s
    }
    getMoveList() {
        return this.getMoveListByTree(this.moveTree)
    }
    getBoard() {
        return this.moveTree.board
    }
    gotoStart() {
        this.moveTree = this.moveTree.getRoot(),
        this.lastMove = null,
        this.board = p.fenToBoard(this.moveTree.getFen()),
        this.turn = p.fenToTurn(this.moveTree.getFen()),
        this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
    }
    undoMove() {
        this.moveTree = this.moveTree.getPrev(),
        this.lastMove = this.moveTree.moveCord,
        this.board = p.fenToBoard(this.moveTree.getFen()),
        this.turn = p.fenToTurn(this.moveTree.getFen()),
        this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree)
    }
    redoMove() {
        let e = this.moveTree;
        return this.moveTree = this.moveTree.getNext(),
        this.moveTree === e ? !1 : (this.lastMove = this.moveTree.moveCord,
        this.board = p.fenToBoard(this.moveTree.getFen()),
        this.turn = p.fenToTurn(this.moveTree.getFen()),
        this.onMoveTreeChange != null && this.onMoveTreeChange(this.moveTree),
        !0)
    }
    getAllPossibleUciMoves(e, t) {
        let s = this.getAllPossibleMoveCords(e, t)
          , o = [];
        for (let n of s)
            o.push(p.moveCordToUciMove(n));
        return o
    }
    getAllPossibleMoveCords(e, t) {
        let s = [];
        for (let o = 0; o < 90; o++) {
            let n = e[o];
            if (n === I.NONE)
                continue;
            let l = [o % 9, Math.floor(o / 9)];
            if (p.getSide(n) === t) {
                let r = this.getValidMoveMap(e, l);
                for (let a = 0; a < 90; a++)
                    (r[a] === g.NORMAL || r[a] === g.CAPTURE) && s.push([l, [a % 9, Math.floor(a / 9)]])
            }
        }
        return s
    }
}
var qe = {
    name: "Xiangqi",
    Xiangqi: je
};
const T = p.ChessPiece
  , X = p.MoveType
  , Y = {
    [T.RED_ROOK]: [0, 10],
    [T.RED_KNIGHT]: [1, 10],
    [T.RED_BISHOP]: [2, 10],
    [T.RED_ADVISOR]: [3, 10],
    [T.RED_KING]: [4, 10],
    [T.RED_CANNON]: [5, 10],
    [T.RED_PAWN]: [6, 10],
    [T.BLACK_ROOK]: [0, 11],
    [T.BLACK_KNIGHT]: [1, 11],
    [T.BLACK_BISHOP]: [2, 11],
    [T.BLACK_ADVISOR]: [3, 11],
    [T.BLACK_KING]: [4, 11],
    [T.BLACK_CANNON]: [5, 11],
    [T.BLACK_PAWN]: [6, 11]
}
  , J = 54
  , ee = 54
  , te = 33
  , ie = 33
  , se = 50
  , oe = 1
  , ze = 500
  , Qe = 550
  , Ze = 500
  , Je = 120;
class $ {
    constructor(e, t) {
        this.logicPos = e,
        this.position = e,
        this.target = null,
        this.piece = t,
        this.animationProgress = 1,
        this.lastFrameTime = 0,
        this.captured = !1
    }
    getPiecePos() {
        if (this.target == null)
            return this.position;
        const e = this.position[0] + (this.target[0] - this.position[0]) * this.ease(this.animationProgress)
          , t = this.position[1] + (this.target[1] - this.position[1]) * this.ease(this.animationProgress);
        return [e, t]
    }
    isInAnimation() {
        return this.target != null
    }
    setTarget(e) {
        this.logicPos = e,
        this.target = e,
        this.animationProgress = 0,
        this.lastFrameTime = performance.now()
    }
    setCaptured() {
        this.captured = !0
    }
    update(e) {
        if (this.target != null) {
            const t = performance.now()
              , s = (t - this.lastFrameTime) / 1e3;
            this.lastFrameTime = t,
            this.animationProgress += e > 0 ? s / e : 1,
            this.animationProgress >= 1 && (this.position = this.target,
            this.target = null,
            this.animationProgress = 1)
        }
    }
    ease(e) {
        return this.easeOutQuad(e)
    }
    easeOutQuad(e) {
        return e * (2 - e)
    }
}
const et = {
    name: "ChessBoard",
    props: {
        pieceSkin: {
            type: Object,
            required: !0
        },
        boardSkin: {
            type: Object,
            required: !0
        },
        showEdit: {
            type: Boolean,
            default: !1
        },
        showArrows: {
            type: Boolean,
            default: !0
        },
        showBoardLabel: {
            type: Boolean,
            default: !0
        },
        bestmoveHint: {
            type: Object,
            default: {}
        },
        ponderHint: {
            type: Object,
            default: {}
        },
        flipBoard: {
            type: Boolean,
            default: !1
        },
        flipHorizontal: {
            type: Boolean,
            default: !1
        },
        lastMove: {
            type: Array,
            default: null
        },
        moveVariants: {
            type: Array,
            default: []
        },
        banMoves: {
            type: Array,
            default: []
        },
        animationTime: {
            default: .2
        },
        showLastMoveUsingArrow: {
            type: Boolean,
            default: !0
        },
        showMoveVariants: {
            type: Boolean,
            default: !0
        },
        pieceScaleRate: {
            type: Number,
            default: 100
        },
        boardScaleRate: {
            type: Number,
            default: 100
        }
    },
    emits: ["makeMove", "editBoard", "resourceReady"],
    data() {
        return {
            canvas: null,
            context: null,
            boxCanvas: null,
            boxContext: null,
            showGifGenerate: !1,
            imgResources: {},
            audioResources: {},
            imgResourceReady: !1,
            audioResourceReady: !1,
            chessBoard: p.getEmptyBoard(),
            chessPieces: [],
            turn: "w",
            moveMap: p.getEmptyBoard(),
            selectedPos: null,
            selectedPieceInBox: null,
            selectedBoxPos: null,
            mousePos: null,
            checkResTimer: null,
            checkAudioResTimer: null
        }
    },
    watch: {
        showEdit: function(i) {
            this.animate()
        },
        flipBoard: function(i) {
            this.animate()
        },
        flipHorizontal: function(i) {
            this.animate()
        },
        bestmoveHint: function(i) {
            this.animate()
        },
        ponderHint: function(i) {
            this.animate()
        },
        pieceScaleRate: function(i) {
            this.animate()
        }
    },
    created() {
        this.loadImageResources(),
        this.loadAudioResources("default")
    },
    mounted() {
        this.canvas = this.$refs.boardDisplay,
        this.context = this.canvas.getContext("2d"),
        this.boxCanvas = this.$refs.boxDisplay,
        this.boxContext = this.boxCanvas.getContext("2d"),
        this.canvas.addEventListener("click", this.onMouseClick),
        this.boxCanvas.addEventListener("click", this.onBoxMouseClick),
        document.addEventListener("visibilitychange", this.handleVisibilityChange)
    },
    beforeDestroy() {
        document.removeEventListener("visibilitychange", this.handleVisibilityChange)
    },
    methods: {
        handleVisibilityChange() {
            document.visibilityState === "visible" && this.drawBoard()
        },
        playSound(i) {
            i in this.audioResources && this.audioResources[i].play()
        },
        getFlippedPos(i) {
            let e = i[0]
              , t = i[1];
            return this.flipBoard && (e = 8 - e,
            t = 9 - t),
            this.flipHorizontal && (e = 8 - e),
            [e, t]
        },
        setFen(i) {
            const e = p.fenToBoard(i)
              , t = p.getBoardDiff(this.chessBoard, e)
              , s = t.newPieces
              , o = t.removedPieces
              , n = t.movedPieces
              , l = [];
            for (let h = 0; h < s.length; h++) {
                const f = s[h]
                  , d = new $(Y[f.piece],f.piece);
                d.setTarget([f.x, f.y]),
                this.chessPieces.push(d)
            }
            for (let h = 0; h < o.length; h++) {
                const f = o[h]
                  , d = this.chessPieces.find(u=>u.logicPos[0] === f.x && u.logicPos[1] === f.y);
                d != null && l.indexOf(d) === -1 && l.push(d)
            }
            for (let h = 0; h < n.length; h++) {
                const f = t.movedPieces[h]
                  , d = this.chessPieces.find(v=>v.logicPos[0] === f.fromX && v.logicPos[1] === f.fromY)
                  , u = this.chessPieces.find(v=>v.logicPos[0] === f.toX && v.logicPos[1] === f.toY);
                d != null && d.setTarget([f.toX, f.toY]),
                u != null && l.indexOf(u) === -1 && l.push(u)
            }
            for (let h = 0; h < l.length; h++)
                l[h].setCaptured();
            const r = this.getBoardFromPieces(this.chessPieces)
              , a = p.getBoardDiff(e, r)
              , c = [];
            for (let h = 0; h < 10; h++)
                for (let f = 0; f < 9; f++) {
                    const d = e[h * 9 + f];
                    d !== T.NONE && c.push(new $([f, h],d))
                }
            (a.diffCount !== 0 || this.countValidPieces(c) !== this.countValidPieces(this.chessPieces)) && (this.chessPieces = c),
            this.chessBoard = new Uint8Array(e),
            this.turn = p.fenToTurn(i),
            this.animate()
        },
        makeMove(i) {
            const e = i[0]
              , t = i[1]
              , s = this.chessBoard[e[1] * 9 + e[0]];
            this.chessBoard[e[1] * 9 + e[0]] = T.NONE,
            this.chessBoard[t[1] * 9 + t[0]] = s,
            this.toggleTurn();
            const o = this.chessPieces.find(l=>l.logicPos[0] === e[0] && l.logicPos[1] === e[1] && !l.captured)
              , n = this.chessPieces.find(l=>l.logicPos[0] === t[0] && l.logicPos[1] === t[1] && !l.captured);
            o != null && o.setTarget(t),
            n != null && n.setCaptured(),
            this.animate()
        },
        movePiece(i) {
            const e = i[0]
              , t = i[1]
              , s = this.chessBoard[e[1] * 9 + e[0]];
            this.chessBoard[e[1] * 9 + e[0]] = T.NONE,
            this.chessBoard[t[1] * 9 + t[0]] = s;
            const o = this.chessPieces.find(l=>l.logicPos[0] === e[0] && l.logicPos[1] === e[1])
              , n = this.chessPieces.find(l=>l.logicPos[0] === t[0] && l.logicPos[1] === t[1]);
            o != null && o.setTarget(t),
            n != null && n.setCaptured(),
            this.animate()
        },
        setPiece(i, e) {
            this.chessBoard[i[1] * 9 + i[0]] = e;
            const t = this.chessPieces.find(o=>o.logicPos[0] === i[0] && o.logicPos[1] === i[1]);
            t != null && t.setCaptured();
            const s = new $(Y[e],e);
            s.setTarget(i),
            this.chessPieces.push(s),
            this.animate()
        },
        removePiece(i) {
            const e = this.chessBoard[i[1] * 9 + i[0]];
            this.chessBoard[i[1] * 9 + i[0]] = T.NONE;
            const t = this.chessPieces.find(s=>s.logicPos[0] === i[0] && s.logicPos[1] === i[1]);
            t != null && (t.setCaptured(),
            t.setTarget(Y[e])),
            this.animate()
        },
        getBoardFromPieces(i) {
            const e = p.getEmptyBoard();
            for (let t = 0; t < i.length; t++) {
                const s = i[t];
                s.captured || (e[s.logicPos[1] * 9 + s.logicPos[0]] = s.piece)
            }
            return e
        },
        countValidPieces(i) {
            let e = 0;
            for (let t = 0; t < i.length; t++)
                i[t].captured === !1 && e++;
            return e
        },
        toggleTurn() {
            this.turn = this.turn === "w" ? "b" : "w"
        },
        undoMove(i, e) {
            const t = i[0]
              , s = i[1];
            this.chessBoard[t[1] * 9 + t[0]] = this.chessBoard[s[1] * 9 + s[0]],
            this.chessBoard[s[1] * 9 + s[0]] = e,
            this.toggleTurn();
            const o = this.chessPieces.find(n=>n.logicPos[0] === s[0] && n.logicPos[1] === s[1]);
            this.chessPieces.find(n=>n.logicPos[0] === t[0] && n.logicPos[1] === t[1]),
            o != null && o.setTarget(t),
            this.chessPieces.push(new $(s,e))
        },
        onMouseClick(i) {
            let e = this.getSkinParams()
              , t = e.offsetX
              , s = e.offsetY
              , o = e.gridWidth
              , n = e.gridHeight
              , l = e.pieceWidth
              , r = this.canvas.getBoundingClientRect()
              , a = r.width
              , c = r.height
              , h = i.clientX - r.left
              , f = i.clientY - r.top
              , d = h / a * ze
              , u = f / c * Qe
              , v = Math.floor((d - t + l / 2) / o)
              , m = Math.floor((u - s + l / 2) / n);
            v < 0 || v >= 9 || m < 0 || m >= 10 || this.onBoardClick(v, m)
        },
        onMouseMove(i) {},
        onBoxMouseClick(i) {
            let e = this.getSkinParams()
              , t = e.offsetX
              , s = e.offsetY
              , o = e.gridWidth
              , n = e.gridHeight
              , l = e.pieceWidth
              , r = this.boxCanvas.getBoundingClientRect()
              , a = r.width
              , c = r.height
              , h = i.clientX - r.left
              , f = i.clientY - r.top
              , d = h / a * Ze
              , u = f / c * Je
              , v = Math.floor((d - t + l / 2) / o)
              , m = Math.floor((u - s + l / 2) / n);
            this.onBoxClick(v, m)
        },
        onBoxClick(i, e) {
            let t = [[T.RED_ROOK, T.RED_KNIGHT, T.RED_BISHOP, T.RED_ADVISOR, T.RED_KING, T.RED_CANNON, T.RED_PAWN], [T.BLACK_ROOK, T.BLACK_KNIGHT, T.BLACK_BISHOP, T.BLACK_ADVISOR, T.BLACK_KING, T.BLACK_CANNON, T.BLACK_PAWN]];
            this.selectedPos == null ? i < 7 && e < 2 ? this.selectedBoxPos != null && this.selectedBoxPos[0] === i && this.selectedBoxPos[1] === e ? (this.selectedBoxPos = null,
            this.selectedPieceInBox = null) : (this.selectedPieceInBox = t[e][i],
            this.selectedBoxPos = [i, e]) : (this.toggleTurn(),
            this.$emit("editBoard", p.boardToFen(this.chessBoard, this.turn))) : (this.removePiece(this.selectedPos),
            this.$emit("editBoard", p.boardToFen(this.chessBoard, this.turn)),
            this.selectedPos = null),
            this.animate()
        },
        onBoardClick(i, e) {
            let t = this.getFlippedPos([i, e]);
            i = t[0],
            e = t[1],
            this.mousePos = [i, e],
            this.showEdit ? this.selectedPieceInBox != null ? (this.setPiece([i, e], this.selectedPieceInBox),
            this.$emit("editBoard", p.boardToFen(this.chessBoard, this.turn)),
            this.selectedPieceInBox = null,
            this.selectedBoxPos = null) : this.selectedPos == null ? this.getPiece([i, e]) !== T.NONE && (this.selectedPos = [i, e]) : this.selectedPos[0] === i && this.selectedPos[1] === e ? this.selectedPos = null : (this.movePiece([this.selectedPos, [i, e]]),
            this.$emit("editBoard", p.boardToFen(this.chessBoard, this.turn)),
            this.selectedPos = null) : this.getPiece([i, e]) !== T.NONE && p.getSide(this.getPiece([i, e])) === this.turn ? (this.selectedPos = [i, e],
            this.getMoveMap()) : this.moveMap != null && (this.moveMap[e * 9 + i] === X.CAPTURE || this.moveMap[e * 9 + i] === X.NORMAL) ? (this.$emit("makeMove", this.selectedPos, [i, e]),
            this.selectedPos = null,
            this.moveMap = null) : (this.moveMap = null,
            this.selectedPos = null),
            this.animate()
        },
        drawLineArrow(i, e, t, s, o, n="black", l="black", r=20, a=1, c=45) {
            let h = .282 * Math.sqrt((e - s) * (e - s) + (t - o) * (t - o));
            h = r;
            const f = c;
            let d, u;
            const v = Math.atan2(t - o, e - s) * 180 / Math.PI
              , m = (v + f) * Math.PI / 180
              , w = (v - f) * Math.PI / 180
              , M = h * Math.cos(m)
              , _ = h * Math.sin(m)
              , S = h * Math.cos(w)
              , b = h * Math.sin(w)
              , x = e > s
              , B = t > o;
            d = s + M,
            u = o + _;
            const y = s + S
              , N = o + b
              , E = B ? d + .25 * Math.abs(y - d) : d - .25 * Math.abs(y - d)
              , L = x ? u - .25 * Math.abs(N - u) : u + .25 * Math.abs(N - u)
              , k = B ? d + .75 * Math.abs(y - d) : d - .75 * Math.abs(y - d)
              , V = x ? u - .75 * Math.abs(N - u) : u + .75 * Math.abs(N - u);
            i.beginPath(),
            i.moveTo(e, t),
            i.lineTo(E, L),
            i.lineTo(d, u),
            i.lineTo(s, o),
            i.lineTo(y, N),
            i.lineTo(k, V),
            i.lineTo(e, t),
            i.closePath(),
            i.strokeStyle = l,
            i.fillStyle = n,
            i.fill(),
            i.lineWidth = r / 8,
            i.stroke()
        },
        drawGifBoard(i, e, t, s, o=2) {
            let n = this.getSkinParams()
              , l = n.offsetX
              , r = n.offsetY
              , a = n.gridWidth
              , c = n.gridHeight
              , h = n.pieceWidth
              , f = this.imgResources;
            e.clearRect(0, 0, i.width * o, i.height * o),
            e.drawImage(f.board_plain, 0, 0, 500 * o, 550 * o);
            for (let d = 0; d < 10; d++)
                for (let u = 0; u < 9; u++) {
                    let v = t[d * 9 + u];
                    if (v !== T.NONE) {
                        let m = this.getFlippedPos([u, d])
                          , w = m[0] * a + l - h / 2
                          , M = m[1] * c + r - h / 2;
                        e.drawImage(f[p.PieceToCharMap[v]], w * o, M * o, h * o, h * o)
                    }
                }
            if (s != null) {
                let d = s
                  , u = d[0]
                  , v = d[1]
                  , m = this.getFlippedPos(u)
                  , w = this.getFlippedPos(v)
                  , M = m[0]
                  , _ = m[1]
                  , S = w[0]
                  , b = w[1]
                  , x = M * a + l
                  , B = _ * c + r
                  , y = S * a + l
                  , N = b * c + r
                  , E = Math.sqrt((x - y) * (x - y) + (B - N) * (B - N))
                  , L = x + (y - x) * (E - 30) / E
                  , k = B + (N - B) * (E - 30) / E;
                this.drawLineArrow(e, x * o, B * o, L * o, k * o, "#9d7857", "#70563f", 15 * o)
            }
        },
        getSkinParams() {
            let i = te
              , e = ie
              , t = J
              , s = ee
              , o = se
              , n = oe;
            if (this.boardSkin.params) {
                let l = this.boardSkin.params;
                i = l.offsetX ? l.offsetX : te,
                e = l.offsetY ? l.offsetY : ie,
                t = l.gridWidth ? l.gridWidth : J,
                s = l.gridHeight ? l.gridHeight : ee,
                n = l.pieceScale ? l.pieceScale : oe,
                n = n * this.pieceScaleRate / 100
            }
            if (this.pieceSkin.params) {
                let l = this.pieceSkin.params;
                o = l.pieceWidth ? l.pieceWidth : se
            }
            return {
                offsetX: i,
                offsetY: e,
                gridWidth: t,
                gridHeight: s,
                pieceWidth: o * n
            }
        },
        drawBoard(i=2) {
            let e = this.getSkinParams()
              , t = e.offsetX
              , s = e.offsetY
              , o = e.gridWidth
              , n = e.gridHeight
              , l = e.pieceWidth;
            if (!this.imgResourceReady)
                return;
            let r = this.context
              , a = this.imgResources;
            r.clearRect(0, 0, this.canvas.width * i, this.canvas.height * i),
            this.showGifGenerate ? r.drawImage(a.board_plain, 0, 0, 500 * i, 550 * i) : r.drawImage(a.board, 0, 0, 500 * i, 550 * i),
            this.drawLabels(i);
            for (let h = 0; h < this.chessPieces.length; h++) {
                let f = this.chessPieces[h];
                if (!f.isInAnimation()) {
                    let d = f.getPiecePos()
                      , u = this.getFlippedPos(d)
                      , v = u[0] * o + t - l / 2
                      , m = u[1] * n + s - l / 2;
                    r.drawImage(a[p.PieceToCharMap[f.piece]], v * i, m * i, l * i, l * i)
                }
            }
            let c = this.chessPieces.filter(h=>h.isInAnimation());
            c.sort((h,f)=>f.animationProgress - h.animationProgress);
            for (let h = 0; h < c.length; h++) {
                let f = c[h]
                  , d = f.getPiecePos()
                  , u = this.getFlippedPos(d)
                  , v = u[0] * o + t - l / 2
                  , m = u[1] * n + s - l / 2;
                r.drawImage(a[p.PieceToCharMap[f.piece]], v * i, m * i, l * i, l * i)
            }
            if (this.lastMove != null && !this.showEdit) {
                let h = this.lastMove
                  , f = h[0]
                  , d = h[1]
                  , u = f[0]
                  , v = f[1]
                  , m = d[0]
                  , w = d[1];
                const M = this.chessPieces.find(k=>k.logicPos[0] === m && k.logicPos[1] === w);
                M != null && (m = M.getPiecePos()[0],
                w = M.getPiecePos()[1]);
                let _ = this.getFlippedPos([u, v])
                  , S = this.getFlippedPos([m, w]);
                u = _[0],
                v = _[1],
                m = S[0],
                w = S[1];
                let b = u * o + t
                  , x = v * n + s
                  , B = m * o + t
                  , y = w * n + s
                  , N = Math.sqrt((b - B) * (b - B) + (x - y) * (x - y))
                  , E = b + (B - b) * (N - 30) / N
                  , L = x + (y - x) * (N - 30) / N;
                this.showGifGenerate ? this.drawLineArrow(r, b * i, x * i, E * i, L * i, "#86674b", "#86674b", 15 * i) : this.showLastMoveUsingArrow ? this.drawLineArrow(r, b * i, x * i, E * i, L * i, "rgba(128, 171, 69, 0.7)", "rgba(80, 105, 51, 0.3)", 15 * i) : (b = u * o + t - l / 2,
                x = v * n + s - l / 2,
                B = m * o + t - l / 2,
                y = w * n + s - l / 2,
                r.drawImage(a.from, b * i, x * i, l * i, l * i),
                r.drawImage(a.to, B * i, y * i, l * i, l * i))
            }
            if (this.drawMoveVariants(),
            !this.showEdit && this.getPiece(this.selectedPos) !== T.NONE) {
                let h = this.moveMap;
                for (let f = 0; f < 10; f++)
                    for (let d = 0; d < 9; d++) {
                        let u = h[f * 9 + d];
                        if (u !== X.BLOCK) {
                            let v = this.getFlippedPos([d, f])
                              , m = v[0] * o + t - l / 2
                              , w = v[1] * n + s - l / 2;
                            u !== X.INVALID && r.drawImage(a.path_go, m * i, w * i, l * i, l * i)
                        }
                    }
            }
            if (this.selectedPos != null) {
                let h = this.selectedPos
                  , f = this.getFlippedPos(h)
                  , d = f[0]
                  , u = f[1];
                r.drawImage(a.selection, (d * o + t - l / 2) * i, (u * n + s - l / 2) * i, l * i, l * i)
            }
            this.drawHints(i),
            this.showEdit && this.drawPieceBox()
        },
        drawHints(i=2) {
            let e = this.getSkinParams()
              , t = e.offsetX
              , s = e.offsetY
              , o = e.gridWidth
              , n = e.gridHeight;
            e.pieceWidth;
            let l = this.context;
            const r = []
              , a = [];
            if (!this.showEdit && this.showArrows) {
                for (let c in this.bestmoveHint) {
                    let h = this.bestmoveHint[c]
                      , f = h[0]
                      , d = h[1]
                      , u = this.getFlippedPos(f)
                      , v = this.getFlippedPos(d)
                      , m = u[0]
                      , w = u[1]
                      , M = v[0]
                      , _ = v[1]
                      , S = m * o + t
                      , b = w * n + s
                      , x = M * o + t
                      , B = _ * n + s;
                    if (this.drawLineArrow(l, S * i, b * i, x * i, B * i, "rgba(87, 179, 255, 0.7)", "rgba(45, 94, 134, 0.3)", Math.max(5, 15) * i),
                    Object.keys(this.bestmoveHint).length > 1) {
                        let y = x - S
                          , N = B - b
                          , E = Math.sqrt(y * y + N * N)
                          , L = 5 * i;
                        E === 0 && (E = 1);
                        let k = y / E
                          , V = N / E
                          , H = x - k * L
                          , U = B - V * L;
                        r.push({
                            x: H,
                            y: U,
                            text: c
                        })
                    }
                }
                for (let c in this.ponderHint) {
                    let h = this.ponderHint[c]
                      , f = h[0]
                      , d = h[1]
                      , u = this.getFlippedPos(f)
                      , v = this.getFlippedPos(d)
                      , m = u[0]
                      , w = u[1]
                      , M = v[0]
                      , _ = v[1]
                      , S = m * o + t
                      , b = w * n + s
                      , x = M * o + t
                      , B = _ * n + s;
                    if (this.drawLineArrow(l, S * i, b * i, x * i, B * i, "rgba(255, 102, 122, 0.7)", "rgba(140, 55, 67, 0.3)", Math.max(5, 15) * i),
                    Object.keys(this.ponderHint).length > 1) {
                        let y = x - S
                          , N = B - b
                          , E = Math.sqrt(y * y + N * N)
                          , L = 5 * i;
                        E === 0 && (E = 1);
                        let k = y / E
                          , V = N / E
                          , H = x - k * L
                          , U = B - V * L;
                        a.push({
                            x: H,
                            y: U,
                            text: c
                        })
                    }
                }
                if (this.banMoves != null)
                    for (let c of this.banMoves) {
                        let h = p.uciMoveToMoveCord(c)
                          , f = this.getFlippedPos(h[0])
                          , d = this.getFlippedPos(h[1])
                          , u = f[0]
                          , v = f[1]
                          , m = d[0]
                          , w = d[1];
                        this.drawLineArrow(l, (u * o + t) * i, (v * n + s) * i, (m * o + t) * i, (w * n + s) * i, "rgba(114,114,114,0.3)", "rgba(114,114,114,0.3)", 15 * i)
                    }
                for (let c of r) {
                    const {text: h, x: f, y: d} = c;
                    l.font = "Bold 25px Arial",
                    l.fillStyle = "rgb(255,255,255)",
                    l.textAlign = "center",
                    l.textBaseline = "middle",
                    l.fillText(h, f * i, d * i + .5 * i)
                }
                for (let c of a) {
                    const {text: h, x: f, y: d} = c;
                    l.font = "Bold 25px Arial",
                    l.fillStyle = "rgb(255,255,255)",
                    l.textAlign = "center",
                    l.textBaseline = "middle",
                    l.fillText(h, f * i, d * i + .5 * i)
                }
            }
        },
        drawLabels(i=2) {
            if (!this.showBoardLabel)
                return;
            let e = this.getSkinParams()
              , t = e.offsetX
              , s = e.offsetY
              , o = e.gridWidth
              , n = e.gridHeight;
            e.pieceWidth;
            let l = this.context
              , r = ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D"]
              , a = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
            l.font = "Bold 30px Arial",
            l.fillStyle = "rgba(122, 87, 51, 0.8)",
            l.strokeStyle = "rgba(255,255,255,0.5)",
            l.lineWidth = 2,
            l.textAlign = "center",
            l.textBaseline = "middle";
            for (let c = 0; c < 9; c++) {
                let h = this.getFlippedPos([c, -.3])
                  , f = this.getFlippedPos([c, 9.35]);
                l.strokeText(a[c], (h[0] * o + t) * i, (h[1] * n + s) * i),
                l.fillText(a[c], (h[0] * o + t) * i, (h[1] * n + s) * i),
                l.strokeText(r[8 - c], (f[0] * o + t) * i, (f[1] * n + s) * i),
                l.fillText(r[8 - c], (f[0] * o + t) * i, (f[1] * n + s) * i)
            }
        },
        drawMoveVariants(i=2) {
            if (!this.showMoveVariants)
                return;
            let e = this.getSkinParams()
              , t = e.offsetX
              , s = e.offsetY
              , o = e.gridWidth
              , n = e.gridHeight;
            e.pieceWidth;
            let l = this.context;
            if (this.imgResources,
            this.moveVariants && this.moveVariants.length > 1 && !this.showGifGenerate) {
                const r = [];
                for (let a = 0; a < this.moveVariants.length; a++) {
                    const c = this.moveVariants[a]
                      , h = c.moveCord
                      , f = c.index;
                    let d = h[0]
                      , u = h[1]
                      , v = d[0]
                      , m = d[1]
                      , w = u[0]
                      , M = u[1]
                      , _ = this.getFlippedPos([v, m])
                      , S = this.getFlippedPos([w, M]);
                    v = _[0],
                    m = _[1],
                    w = S[0],
                    M = S[1];
                    let b = v * o + t
                      , x = m * n + s
                      , B = w * o + t
                      , y = M * n + s
                      , N = Math.sqrt((b - B) * (b - B) + (x - y) * (x - y))
                      , E = b + (B - b) * N / N
                      , L = x + (y - x) * N / N;
                    this.drawLineArrow(l, b * i, x * i, E * i, L * i, "rgba(128, 171, 69, 0.7)", "rgba(80, 105, 51, 0.3)", 15 * i, 1, 45);
                    let k = B - b
                      , V = y - x
                      , H = Math.sqrt(k * k + V * V)
                      , U = 10 * i;
                    H === 0 && (H = 1);
                    let Pe = k / H
                      , Te = V / H
                      , Me = B - Pe * U
                      , Ce = y - Te * U;
                    r.push({
                        x: Me * i,
                        y: Ce * i,
                        text: f
                    })
                }
                for (let a of r) {
                    const {text: c, x: h, y: f} = a;
                    l.beginPath(),
                    l.arc(h, f, 9 * i, 0, 2 * Math.PI),
                    l.fillStyle = "rgba(92,105,74,0.7)",
                    l.fill(),
                    l.font = "Bold 30px Arial",
                    l.fillStyle = "rgb(255,255,255)",
                    l.textAlign = "center",
                    l.textBaseline = "middle",
                    l.fillText(c, h, f + .5 * i)
                }
            }
        },
        drawPieceBox(i=2) {
            let e = this.getSkinParams()
              , t = e.offsetX
              , s = e.offsetY
              , o = e.gridWidth
              , n = e.gridHeight
              , l = e.pieceWidth
              , r = this.boxContext
              , a = this.imgResources;
            r.fillStyle = "#d0a274",
            r.fillRect(0, 0, 400 * i, 150 * i);
            let c = [["R", "N", "B", "A", "K", "C", "P"], ["r", "n", "b", "a", "k", "c", "p"]];
            for (let h = 0; h < 2; h++)
                for (let f = 0; f < 7; f++) {
                    let d = c[h][f]
                      , u = f * o + t - l / 2
                      , v = h * n + s - l / 2;
                    r.drawImage(a[d], u * i, v * i, l * i, l * i)
                }
            if (this.selectedBoxPos != null) {
                let h = this.selectedBoxPos
                  , f = h[0]
                  , d = h[1];
                r.drawImage(a.selection, (f * o + t - l / 2) * i, (d * n + s - l / 2) * i, l * i, l * i)
            }
            this.turn === "w" ? r.drawImage(a.red_first, 400 * i, 0, 100 * i, 120 * i) : r.drawImage(a.black_first, 400 * i, 0, 100 * i, 120 * i)
        },
        getMoveMap() {
            if (this.selectedPos != null) {
                const i = new qe.Xiangqi(p.boardToFen(this.chessBoard));
                this.moveMap = i.getValidMoveMap(this.chessBoard, this.selectedPos)
            } else
                this.moveMap = p.getEmptyBoard()
        },
        getPiece(i) {
            return i == null ? T.NONE : this.chessBoard[i[1] * 9 + i[0]]
        },
        animate() {
            for (let e of this.chessPieces)
                e.update(this.animationTime);
            let i = this.isAllAnimationFinished();
            this.chessPieces = this.chessPieces.filter(e=>!e.captured || this.chessPieces.some(t=>t.target != null && t.target[0] === e.logicPos[0] && t.target[1] === e.logicPos[1])),
            this.drawBoard(),
            i || requestAnimationFrame(this.animate)
        },
        isAllAnimationFinished() {
            for (let i of this.chessPieces)
                if (i.target != null)
                    return !1;
            return !0
        },
        async loadImageResources() {
            const i = "rnbakcpRNBAKCP".split("")
              , e = `/skins/piece/${this.pieceSkin.name}/`
              , t = `/skins/board/${this.boardSkin.name}/`
              , s = "/skins/default/"
              , o = (r,a)=>new Promise((c,h)=>{
                const f = new Image;
                let d = !1;
                f.onload = ()=>c(f),
                f.onerror = ()=>{
                    !d && a ? (d = !0,
                    f.src = a) : h(new Error(`Failed to load image: ${r}`))
                }
                ,
                f.src = r
            }
            )
              , n = [];
            for (let r of i) {
                const c = `${r.toUpperCase() === r ? "w" : "b"}${r.toLowerCase()}`
                  , h = `${e}${c}.${this.pieceSkin.ext}`
                  , f = `${s}${c}.webp`;
                n.push(o(h, f).then(d=>{
                    this.imgResources[r] = d
                }
                ).catch(d=>{
                    console.error(d)
                }
                ))
            }
            const l = "board board_plain selection path_go path_eat red_first black_first from to".split(" ");
            for (let r of l) {
                const a = `${t}${r}.${this.boardSkin.ext}`
                  , c = `${s}${r}.webp`;
                n.push(o(a, c).then(h=>{
                    this.imgResources[r] = h
                }
                ).catch(h=>{
                    console.error(h)
                }
                ))
            }
            try {
                await Promise.all(n),
                this.onImageReady()
            } catch (r) {
                console.error("Some images failed to load:", r)
            }
        },
        onImageReady() {
            this.imgResourceReady = !0,
            this.drawBoard(),
            this.$emit("resourceReady"),
            console.log("Image Ready, imgReady: ", this.imgResourceReady, "audioReady: ", this.audioResourceReady)
        },
        async loadAudioResources(i="default") {
            const e = ["move", "capture", "check", "checkmate"]
              , t = `./skins/${i}/`
              , s = o=>new Promise((n,l)=>{
                try {
                    const r = Oe(`${t}${o}.wav`);
                    r.onLoad = ()=>{
                        n()
                    }
                    ,
                    r.onError = a=>{
                        console.error(`Error loading sound ${o}:`, a),
                        n()
                    }
                    ,
                    this.audioResources[o] = r
                } catch (r) {
                    console.error(`Exception loading sound ${o}:`, r),
                    n()
                }
            }
            );
            try {
                const o = e.map(n=>s(n));
                await Promise.all(o),
                this.onAudioReady()
            } catch (o) {
                console.error("Error loading audio resources:", o)
            }
        },
        onAudioReady() {
            this.audioResourceReady = !0,
            console.log("Audio Ready, imgReady: ", this.imgResourceReady, "audioReady: ", this.audioResourceReady)
        }
    }
}
  , tt = {
    id: "boardDisplay",
    ref: "boardDisplay",
    width: "1000",
    height: "1100"
}
  , it = {
    id: "boxDisplay",
    ref: "boxDisplay",
    width: "1000",
    height: "240"
};
function st(i, e, t, s, o, n) {
    return Ne(),
    be("div", null, [Q("canvas", tt, null, 512), Ie(Q("canvas", it, null, 512), [[Ee, t.showEdit]])])
}
var rt = we(et, [["render", st], ["__scopeId", "data-v-06b3c364"]]);
export {rt as C, pe as U, qe as X, p as a, ve as b, me as m};
