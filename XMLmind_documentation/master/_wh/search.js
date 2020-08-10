function Snowball() {
function Among(s, substring_i, result, method) {
if ((!s && s != "") || (!substring_i && (substring_i != 0)) || !result)
throw ("Bad Among initialisation: s:" + s + ", substring_i: "
+ substring_i + ", result: " + result);
this.s_size = s.length;
this.s = (function() {
var sLength = s.length, charArr = new Array(sLength);
for (var i = 0; i < sLength; i++)
charArr[i] = s.charCodeAt(i);
return charArr;})();
this.substring_i = substring_i;
this.result = result;
this.method = method;
}
function SnowballProgram() {
var current;
return {
bra : 0,
ket : 0,
limit : 0,
cursor : 0,
limit_backward : 0,
setCurrent : function(word) {
current = word;
this.cursor = 0;
this.limit = word.length;
this.limit_backward = 0;
this.bra = this.cursor;
this.ket = this.limit;
},
getCurrent : function() {
var result = current;
current = null;
return result;
},
in_grouping : function(s, min, max) {
if (this.cursor >= this.limit) return false;
var ch = current.charCodeAt(this.cursor);
if (ch > max || ch < min) return false;
ch -= min;
if ((s[ch >> 3] & (0X1 << (ch & 0X7))) == 0) return false;
this.cursor++;
return true;
},
in_grouping_b : function(s, min, max) {
if (this.cursor <= this.limit_backward) return false;
var ch = current.charCodeAt(this.cursor - 1);
if (ch > max || ch < min) return false;
ch -= min;
if ((s[ch >> 3] & (0X1 << (ch & 0X7))) == 0) return false;
this.cursor--;
return true;
},
out_grouping : function(s, min, max) {
if (this.cursor >= this.limit) return false;
var ch = current.charCodeAt(this.cursor);
if (ch > max || ch < min) {
this.cursor++;
return true;
}
ch -= min;
if ((s[ch >> 3] & (0X1 << (ch & 0X7))) == 0) {
this.cursor ++;
return true;
}
return false;
},
out_grouping_b : function(s, min, max) {
if (this.cursor <= this.limit_backward) return false;
var ch = current.charCodeAt(this.cursor - 1);
if (ch > max || ch < min) {
this.cursor--;
return true;
}
ch -= min;
if ((s[ch >> 3] & (0X1 << (ch & 0X7))) == 0) {
this.cursor--;
return true;
}
return false;
},
eq_s : function(s_size, s) {
if (this.limit - this.cursor < s_size) return false;
var i;
for (i = 0; i != s_size; i++) {
if (current.charCodeAt(this.cursor + i) != s.charCodeAt(i)) return false;
}
this.cursor += s_size;
return true;
},
eq_s_b : function(s_size, s) {
if (this.cursor - this.limit_backward < s_size) return false;
var i;
for (i = 0; i != s_size; i++) {
if (current.charCodeAt(this.cursor - s_size + i) != s.charCodeAt(i)) return false;
}
this.cursor -= s_size;
return true;
},
eq_v_b : function(s) {
return this.eq_s_b(s.length, s);
},
find_among : function(v, v_size) {
var i = 0, j = v_size, c = this.cursor, l = this.limit, common_i = 0, common_j = 0, first_key_inspected = false;
while (true) {
var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
? common_i
: common_j, w = v[k];
for (var i2 = common; i2 < w.s_size; i2++) {
if (c + common == l) {
diff = -1;
break;
}
diff = current.charCodeAt(c + common) - w.s[i2];
if (diff)
break;
common++;
}
if (diff < 0) {
j = k;
common_j = common;
} else {
i = k;
common_i = common;
}
if (j - i <= 1) {
if (i > 0 || j == i || first_key_inspected)
break;
first_key_inspected = true;
}
}
while (true) {
var w = v[i];
if (common_i >= w.s_size) {
this.cursor = c + w.s_size;
if (!w.method)
return w.result;
var res = w.method();
this.cursor = c + w.s_size;
if (res)
return w.result;
}
i = w.substring_i;
if (i < 0)
return 0;
}
},
find_among_b : function(v, v_size) {
var i = 0, j = v_size, c = this.cursor, lb = this.limit_backward, common_i = 0, common_j = 0, first_key_inspected = false;
while (true) {
var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
? common_i
: common_j, w = v[k];
for (var i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
if (c - common == lb) {
diff = -1;
break;
}
diff = current.charCodeAt(c - 1 - common) - w.s[i2];
if (diff)
break;
common++;
}
if (diff < 0) {
j = k;
common_j = common;
} else {
i = k;
common_i = common;
}
if (j - i <= 1) {
if (i > 0 || j == i || first_key_inspected)
break;
first_key_inspected = true;
}
}
while (true) {
var w = v[i];
if (common_i >= w.s_size) {
this.cursor = c - w.s_size;
if (!w.method)
return w.result;
var res = w.method();
this.cursor = c - w.s_size;
if (res)
return w.result;
}
i = w.substring_i;
if (i < 0)
return 0;
}
},
replace_s : function(c_bra, c_ket, s) {
var adjustment = s.length - (c_ket - c_bra), left = current
.substring(0, c_bra), right = current.substring(c_ket);
current = left + s + right;
this.limit += adjustment;
if (this.cursor >= c_ket)
this.cursor += adjustment;
else if (this.cursor > c_bra)
this.cursor = c_bra;
return adjustment;
},
slice_check : function() {
if (this.bra < 0 ||
this.bra > this.ket ||
this.ket > this.limit ||
this.limit > current.length)
{
throw ("faulty slice operation");
}
},
slice_from : function(s) {
this.slice_check();
this.replace_s(this.bra, this.ket, s);
},
slice_del : function() {
this.slice_from("");
},
insert : function(c_bra, c_ket, s) {
var adjustment = this.replace_s(c_bra, c_ket, s);
if (c_bra <= this.bra) this.bra += adjustment;
if (c_bra <= this.ket) this.ket += adjustment;
},
slice_to : function() {
this.slice_check();
return current.substring(this.bra, this.ket);
},
get_size_of_p : function() {
return current ? encodeURIComponent(current).match(/%..|./g).length + 1 : 1;
}
};
}
function englishStemmer() {
var a_0 = [
new Among ( "arsen", -1, -1 ),
new Among ( "commun", -1, -1 ),
new Among ( "gener", -1, -1 )
];
var a_1 = [
new Among ( "'", -1, 1 ),
new Among ( "'s'", 0, 1 ),
new Among ( "'s", -1, 1 )
];
var a_2 = [
new Among ( "ied", -1, 2 ),
new Among ( "s", -1, 3 ),
new Among ( "ies", 1, 2 ),
new Among ( "sses", 1, 1 ),
new Among ( "ss", 1, -1 ),
new Among ( "us", 1, -1 )
];
var a_3 = [
new Among ( "", -1, 3 ),
new Among ( "bb", 0, 2 ),
new Among ( "dd", 0, 2 ),
new Among ( "ff", 0, 2 ),
new Among ( "gg", 0, 2 ),
new Among ( "bl", 0, 1 ),
new Among ( "mm", 0, 2 ),
new Among ( "nn", 0, 2 ),
new Among ( "pp", 0, 2 ),
new Among ( "rr", 0, 2 ),
new Among ( "at", 0, 1 ),
new Among ( "tt", 0, 2 ),
new Among ( "iz", 0, 1 )
];
var a_4 = [
new Among ( "ed", -1, 2 ),
new Among ( "eed", 0, 1 ),
new Among ( "ing", -1, 2 ),
new Among ( "edly", -1, 2 ),
new Among ( "eedly", 3, 1 ),
new Among ( "ingly", -1, 2 )
];
var a_5 = [
new Among ( "anci", -1, 3 ),
new Among ( "enci", -1, 2 ),
new Among ( "ogi", -1, 13 ),
new Among ( "li", -1, 16 ),
new Among ( "bli", 3, 12 ),
new Among ( "abli", 4, 4 ),
new Among ( "alli", 3, 8 ),
new Among ( "fulli", 3, 14 ),
new Among ( "lessli", 3, 15 ),
new Among ( "ousli", 3, 10 ),
new Among ( "entli", 3, 5 ),
new Among ( "aliti", -1, 8 ),
new Among ( "biliti", -1, 12 ),
new Among ( "iviti", -1, 11 ),
new Among ( "tional", -1, 1 ),
new Among ( "ational", 14, 7 ),
new Among ( "alism", -1, 8 ),
new Among ( "ation", -1, 7 ),
new Among ( "ization", 17, 6 ),
new Among ( "izer", -1, 6 ),
new Among ( "ator", -1, 7 ),
new Among ( "iveness", -1, 11 ),
new Among ( "fulness", -1, 9 ),
new Among ( "ousness", -1, 10 )
];
var a_6 = [
new Among ( "icate", -1, 4 ),
new Among ( "ative", -1, 6 ),
new Among ( "alize", -1, 3 ),
new Among ( "iciti", -1, 4 ),
new Among ( "ical", -1, 4 ),
new Among ( "tional", -1, 1 ),
new Among ( "ational", 5, 2 ),
new Among ( "ful", -1, 5 ),
new Among ( "ness", -1, 5 )
];
var a_7 = [
new Among ( "ic", -1, 1 ),
new Among ( "ance", -1, 1 ),
new Among ( "ence", -1, 1 ),
new Among ( "able", -1, 1 ),
new Among ( "ible", -1, 1 ),
new Among ( "ate", -1, 1 ),
new Among ( "ive", -1, 1 ),
new Among ( "ize", -1, 1 ),
new Among ( "iti", -1, 1 ),
new Among ( "al", -1, 1 ),
new Among ( "ism", -1, 1 ),
new Among ( "ion", -1, 2 ),
new Among ( "er", -1, 1 ),
new Among ( "ous", -1, 1 ),
new Among ( "ant", -1, 1 ),
new Among ( "ent", -1, 1 ),
new Among ( "ment", 15, 1 ),
new Among ( "ement", 16, 1 )
];
var a_8 = [
new Among ( "e", -1, 1 ),
new Among ( "l", -1, 2 )
];
var a_9 = [
new Among ( "succeed", -1, -1 ),
new Among ( "proceed", -1, -1 ),
new Among ( "exceed", -1, -1 ),
new Among ( "canning", -1, -1 ),
new Among ( "inning", -1, -1 ),
new Among ( "earring", -1, -1 ),
new Among ( "herring", -1, -1 ),
new Among ( "outing", -1, -1 )
];
var a_10 = [
new Among ( "andes", -1, -1 ),
new Among ( "atlas", -1, -1 ),
new Among ( "bias", -1, -1 ),
new Among ( "cosmos", -1, -1 ),
new Among ( "dying", -1, 3 ),
new Among ( "early", -1, 9 ),
new Among ( "gently", -1, 7 ),
new Among ( "howe", -1, -1 ),
new Among ( "idly", -1, 6 ),
new Among ( "lying", -1, 4 ),
new Among ( "news", -1, -1 ),
new Among ( "only", -1, 10 ),
new Among ( "singly", -1, 11 ),
new Among ( "skies", -1, 2 ),
new Among ( "skis", -1, 1 ),
new Among ( "sky", -1, -1 ),
new Among ( "tying", -1, 5 ),
new Among ( "ugly", -1, 8 )
];
var g_v = [17, 65, 16, 1 ];
var g_v_WXY = [1, 17, 65, 208, 1 ];
var g_valid_LI = [55, 141, 2 ];
var B_Y_found;
var I_p2;
var I_p1;
var sbp = new SnowballProgram();
function r_prelude() {
var v_1;
var v_2;
var v_3;
var v_4;
var v_5;
B_Y_found = false;
v_1 = sbp.cursor;
lab0: do {
sbp.bra = sbp.cursor;
if (!(sbp.eq_s(1, "'")))
{
break lab0;
}
sbp.ket = sbp.cursor;
sbp.slice_del();
} while (false);
sbp.cursor = v_1;
v_2 = sbp.cursor;
lab1: do {
sbp.bra = sbp.cursor;
if (!(sbp.eq_s(1, "y")))
{
break lab1;
}
sbp.ket = sbp.cursor;
sbp.slice_from("Y");
B_Y_found = true;
} while (false);
sbp.cursor = v_2;
v_3 = sbp.cursor;
lab2: do {
replab3: while(true)
{
v_4 = sbp.cursor;
lab4: do {
golab5: while(true)
{
v_5 = sbp.cursor;
lab6: do {
if (!(sbp.in_grouping(g_v, 97, 121)))
{
break lab6;
}
sbp.bra = sbp.cursor;
if (!(sbp.eq_s(1, "y")))
{
break lab6;
}
sbp.ket = sbp.cursor;
sbp.cursor = v_5;
break golab5;
} while (false);
sbp.cursor = v_5;
if (sbp.cursor >= sbp.limit)
{
break lab4;
}
sbp.cursor++;
}
sbp.slice_from("Y");
B_Y_found = true;
continue replab3;
} while (false);
sbp.cursor = v_4;
break replab3;
}
} while (false);
sbp.cursor = v_3;
return true;
}
function r_mark_regions() {
var v_1;
var v_2;
I_p1 = sbp.limit;
I_p2 = sbp.limit;
v_1 = sbp.cursor;
lab0: do {
lab1: do {
v_2 = sbp.cursor;
lab2: do {
if (sbp.find_among(a_0, 3) == 0)
{
break lab2;
}
break lab1;
} while (false);
sbp.cursor = v_2;
golab3: while(true)
{
lab4: do {
if (!(sbp.in_grouping(g_v, 97, 121)))
{
break lab4;
}
break golab3;
} while (false);
if (sbp.cursor >= sbp.limit)
{
break lab0;
}
sbp.cursor++;
}
golab5: while(true)
{
lab6: do {
if (!(sbp.out_grouping(g_v, 97, 121)))
{
break lab6;
}
break golab5;
} while (false);
if (sbp.cursor >= sbp.limit)
{
break lab0;
}
sbp.cursor++;
}
} while (false);
I_p1 = sbp.cursor;
golab7: while(true)
{
lab8: do {
if (!(sbp.in_grouping(g_v, 97, 121)))
{
break lab8;
}
break golab7;
} while (false);
if (sbp.cursor >= sbp.limit)
{
break lab0;
}
sbp.cursor++;
}
golab9: while(true)
{
lab10: do {
if (!(sbp.out_grouping(g_v, 97, 121)))
{
break lab10;
}
break golab9;
} while (false);
if (sbp.cursor >= sbp.limit)
{
break lab0;
}
sbp.cursor++;
}
I_p2 = sbp.cursor;
} while (false);
sbp.cursor = v_1;
return true;
}
function r_shortv() {
var v_1;
lab0: do {
v_1 = sbp.limit - sbp.cursor;
lab1: do {
if (!(sbp.out_grouping_b(g_v_WXY, 89, 121)))
{
break lab1;
}
if (!(sbp.in_grouping_b(g_v, 97, 121)))
{
break lab1;
}
if (!(sbp.out_grouping_b(g_v, 97, 121)))
{
break lab1;
}
break lab0;
} while (false);
sbp.cursor = sbp.limit - v_1;
if (!(sbp.out_grouping_b(g_v, 97, 121)))
{
return false;
}
if (!(sbp.in_grouping_b(g_v, 97, 121)))
{
return false;
}
if (sbp.cursor > sbp.limit_backward)
{
return false;
}
} while (false);
return true;
}
function r_R1() {
if (!(I_p1 <= sbp.cursor))
{
return false;
}
return true;
}
function r_R2() {
if (!(I_p2 <= sbp.cursor))
{
return false;
}
return true;
}
function r_Step_1a() {
var among_var;
var v_1;
var v_2;
v_1 = sbp.limit - sbp.cursor;
lab0: do {
sbp.ket = sbp.cursor;
among_var = sbp.find_among_b(a_1, 3);
if (among_var == 0)
{
sbp.cursor = sbp.limit - v_1;
break lab0;
}
sbp.bra = sbp.cursor;
switch(among_var) {
case 0:
sbp.cursor = sbp.limit - v_1;
break lab0;
case 1:
sbp.slice_del();
break;
}
} while (false);
sbp.ket = sbp.cursor;
among_var = sbp.find_among_b(a_2, 6);
if (among_var == 0)
{
return false;
}
sbp.bra = sbp.cursor;
switch(among_var) {
case 0:
return false;
case 1:
sbp.slice_from("ss");
break;
case 2:
lab1: do {
v_2 = sbp.limit - sbp.cursor;
lab2: do {
{
var c = sbp.cursor - 2;
if (sbp.limit_backward > c || c > sbp.limit)
{
break lab2;
}
sbp.cursor = c;
}
sbp.slice_from("i");
break lab1;
} while (false);
sbp.cursor = sbp.limit - v_2;
sbp.slice_from("ie");
} while (false);
break;
case 3:
if (sbp.cursor <= sbp.limit_backward)
{
return false;
}
sbp.cursor--;
golab3: while(true)
{
lab4: do {
if (!(sbp.in_grouping_b(g_v, 97, 121)))
{
break lab4;
}
break golab3;
} while (false);
if (sbp.cursor <= sbp.limit_backward)
{
return false;
}
sbp.cursor--;
}
sbp.slice_del();
break;
}
return true;
}
function r_Step_1b() {
var among_var;
var v_1;
var v_3;
var v_4;
sbp.ket = sbp.cursor;
among_var = sbp.find_among_b(a_4, 6);
if (among_var == 0)
{
return false;
}
sbp.bra = sbp.cursor;
switch(among_var) {
case 0:
return false;
case 1:
if (!r_R1())
{
return false;
}
sbp.slice_from("ee");
break;
case 2:
v_1 = sbp.limit - sbp.cursor;
golab0: while(true)
{
lab1: do {
if (!(sbp.in_grouping_b(g_v, 97, 121)))
{
break lab1;
}
break golab0;
} while (false);
if (sbp.cursor <= sbp.limit_backward)
{
return false;
}
sbp.cursor--;
}
sbp.cursor = sbp.limit - v_1;
sbp.slice_del();
v_3 = sbp.limit - sbp.cursor;
among_var = sbp.find_among_b(a_3, 13);
if (among_var == 0)
{
return false;
}
sbp.cursor = sbp.limit - v_3;
switch(among_var) {
case 0:
return false;
case 1:
{
var c = sbp.cursor;
sbp.insert(sbp.cursor, sbp.cursor, "e");
sbp.cursor = c;
}
break;
case 2:
sbp.ket = sbp.cursor;
if (sbp.cursor <= sbp.limit_backward)
{
return false;
}
sbp.cursor--;
sbp.bra = sbp.cursor;
sbp.slice_del();
break;
case 3:
if (sbp.cursor != I_p1)
{
return false;
}
v_4 = sbp.limit - sbp.cursor;
if (!r_shortv())
{
return false;
}
sbp.cursor = sbp.limit - v_4;
{
var c = sbp.cursor;
sbp.insert(sbp.cursor, sbp.cursor, "e");
sbp.cursor = c;
}
break;
}
break;
}
return true;
}
function r_Step_1c() {
var v_1;
var v_2;
sbp.ket = sbp.cursor;
lab0: do {
v_1 = sbp.limit - sbp.cursor;
lab1: do {
if (!(sbp.eq_s_b(1, "y")))
{
break lab1;
}
break lab0;
} while (false);
sbp.cursor = sbp.limit - v_1;
if (!(sbp.eq_s_b(1, "Y")))
{
return false;
}
} while (false);
sbp.bra = sbp.cursor;
if (!(sbp.out_grouping_b(g_v, 97, 121)))
{
return false;
}
{
v_2 = sbp.limit - sbp.cursor;
lab2: do {
if (sbp.cursor > sbp.limit_backward)
{
break lab2;
}
return false;
} while (false);
sbp.cursor = sbp.limit - v_2;
}
sbp.slice_from("i");
return true;
}
function r_Step_2() {
var among_var;
sbp.ket = sbp.cursor;
among_var = sbp.find_among_b(a_5, 24);
if (among_var == 0)
{
return false;
}
sbp.bra = sbp.cursor;
if (!r_R1())
{
return false;
}
switch(among_var) {
case 0:
return false;
case 1:
sbp.slice_from("tion");
break;
case 2:
sbp.slice_from("ence");
break;
case 3:
sbp.slice_from("ance");
break;
case 4:
sbp.slice_from("able");
break;
case 5:
sbp.slice_from("ent");
break;
case 6:
sbp.slice_from("ize");
break;
case 7:
sbp.slice_from("ate");
break;
case 8:
sbp.slice_from("al");
break;
case 9:
sbp.slice_from("ful");
break;
case 10:
sbp.slice_from("ous");
break;
case 11:
sbp.slice_from("ive");
break;
case 12:
sbp.slice_from("ble");
break;
case 13:
if (!(sbp.eq_s_b(1, "l")))
{
return false;
}
sbp.slice_from("og");
break;
case 14:
sbp.slice_from("ful");
break;
case 15:
sbp.slice_from("less");
break;
case 16:
if (!(sbp.in_grouping_b(g_valid_LI, 99, 116)))
{
return false;
}
sbp.slice_del();
break;
}
return true;
}
function r_Step_3() {
var among_var;
sbp.ket = sbp.cursor;
among_var = sbp.find_among_b(a_6, 9);
if (among_var == 0)
{
return false;
}
sbp.bra = sbp.cursor;
if (!r_R1())
{
return false;
}
switch(among_var) {
case 0:
return false;
case 1:
sbp.slice_from("tion");
break;
case 2:
sbp.slice_from("ate");
break;
case 3:
sbp.slice_from("al");
break;
case 4:
sbp.slice_from("ic");
break;
case 5:
sbp.slice_del();
break;
case 6:
if (!r_R2())
{
return false;
}
sbp.slice_del();
break;
}
return true;
}
function r_Step_4() {
var among_var;
var v_1;
sbp.ket = sbp.cursor;
among_var = sbp.find_among_b(a_7, 18);
if (among_var == 0)
{
return false;
}
sbp.bra = sbp.cursor;
if (!r_R2())
{
return false;
}
switch(among_var) {
case 0:
return false;
case 1:
sbp.slice_del();
break;
case 2:
lab0: do {
v_1 = sbp.limit - sbp.cursor;
lab1: do {
if (!(sbp.eq_s_b(1, "s")))
{
break lab1;
}
break lab0;
} while (false);
sbp.cursor = sbp.limit - v_1;
if (!(sbp.eq_s_b(1, "t")))
{
return false;
}
} while (false);
sbp.slice_del();
break;
}
return true;
}
function r_Step_5() {
var among_var;
var v_1;
var v_2;
sbp.ket = sbp.cursor;
among_var = sbp.find_among_b(a_8, 2);
if (among_var == 0)
{
return false;
}
sbp.bra = sbp.cursor;
switch(among_var) {
case 0:
return false;
case 1:
lab0: do {
v_1 = sbp.limit - sbp.cursor;
lab1: do {
if (!r_R2())
{
break lab1;
}
break lab0;
} while (false);
sbp.cursor = sbp.limit - v_1;
if (!r_R1())
{
return false;
}
{
v_2 = sbp.limit - sbp.cursor;
lab2: do {
if (!r_shortv())
{
break lab2;
}
return false;
} while (false);
sbp.cursor = sbp.limit - v_2;
}
} while (false);
sbp.slice_del();
break;
case 2:
if (!r_R2())
{
return false;
}
if (!(sbp.eq_s_b(1, "l")))
{
return false;
}
sbp.slice_del();
break;
}
return true;
}
function r_exception2() {
sbp.ket = sbp.cursor;
if (sbp.find_among_b(a_9, 8) == 0)
{
return false;
}
sbp.bra = sbp.cursor;
if (sbp.cursor > sbp.limit_backward)
{
return false;
}
return true;
}
function r_exception1() {
var among_var;
sbp.bra = sbp.cursor;
among_var = sbp.find_among(a_10, 18);
if (among_var == 0)
{
return false;
}
sbp.ket = sbp.cursor;
if (sbp.cursor < sbp.limit)
{
return false;
}
switch(among_var) {
case 0:
return false;
case 1:
sbp.slice_from("ski");
break;
case 2:
sbp.slice_from("sky");
break;
case 3:
sbp.slice_from("die");
break;
case 4:
sbp.slice_from("lie");
break;
case 5:
sbp.slice_from("tie");
break;
case 6:
sbp.slice_from("idl");
break;
case 7:
sbp.slice_from("gentl");
break;
case 8:
sbp.slice_from("ugli");
break;
case 9:
sbp.slice_from("earli");
break;
case 10:
sbp.slice_from("onli");
break;
case 11:
sbp.slice_from("singl");
break;
}
return true;
}
function r_postlude() {
var v_1;
var v_2;
if (!(B_Y_found))
{
return false;
}
replab0: while(true)
{
v_1 = sbp.cursor;
lab1: do {
golab2: while(true)
{
v_2 = sbp.cursor;
lab3: do {
sbp.bra = sbp.cursor;
if (!(sbp.eq_s(1, "Y")))
{
break lab3;
}
sbp.ket = sbp.cursor;
sbp.cursor = v_2;
break golab2;
} while (false);
sbp.cursor = v_2;
if (sbp.cursor >= sbp.limit)
{
break lab1;
}
sbp.cursor++;
}
sbp.slice_from("y");
continue replab0;
} while (false);
sbp.cursor = v_1;
break replab0;
}
return true;
}
this.stem = function() {
var v_1;
var v_2;
var v_3;
var v_4;
var v_5;
var v_6;
var v_7;
var v_8;
var v_9;
var v_10;
var v_11;
var v_12;
var v_13;
lab0: do {
v_1 = sbp.cursor;
lab1: do {
if (!r_exception1())
{
break lab1;
}
break lab0;
} while (false);
sbp.cursor = v_1;
lab2: do {
{
v_2 = sbp.cursor;
lab3: do {
{
var c = sbp.cursor + 3;
if (0 > c || c > sbp.limit)
{
break lab3;
}
sbp.cursor = c;
}
break lab2;
} while (false);
sbp.cursor = v_2;
}
break lab0;
} while (false);
sbp.cursor = v_1;
v_3 = sbp.cursor;
lab4: do {
if (!r_prelude())
{
break lab4;
}
} while (false);
sbp.cursor = v_3;
v_4 = sbp.cursor;
lab5: do {
if (!r_mark_regions())
{
break lab5;
}
} while (false);
sbp.cursor = v_4;
sbp.limit_backward = sbp.cursor; sbp.cursor = sbp.limit;
v_5 = sbp.limit - sbp.cursor;
lab6: do {
if (!r_Step_1a())
{
break lab6;
}
} while (false);
sbp.cursor = sbp.limit - v_5;
lab7: do {
v_6 = sbp.limit - sbp.cursor;
lab8: do {
if (!r_exception2())
{
break lab8;
}
break lab7;
} while (false);
sbp.cursor = sbp.limit - v_6;
v_7 = sbp.limit - sbp.cursor;
lab9: do {
if (!r_Step_1b())
{
break lab9;
}
} while (false);
sbp.cursor = sbp.limit - v_7;
v_8 = sbp.limit - sbp.cursor;
lab10: do {
if (!r_Step_1c())
{
break lab10;
}
} while (false);
sbp.cursor = sbp.limit - v_8;
v_9 = sbp.limit - sbp.cursor;
lab11: do {
if (!r_Step_2())
{
break lab11;
}
} while (false);
sbp.cursor = sbp.limit - v_9;
v_10 = sbp.limit - sbp.cursor;
lab12: do {
if (!r_Step_3())
{
break lab12;
}
} while (false);
sbp.cursor = sbp.limit - v_10;
v_11 = sbp.limit - sbp.cursor;
lab13: do {
if (!r_Step_4())
{
break lab13;
}
} while (false);
sbp.cursor = sbp.limit - v_11;
v_12 = sbp.limit - sbp.cursor;
lab14: do {
if (!r_Step_5())
{
break lab14;
}
} while (false);
sbp.cursor = sbp.limit - v_12;
} while (false);
sbp.cursor = sbp.limit_backward;
v_13 = sbp.cursor;
lab15: do {
if (!r_postlude())
{
break lab15;
}
} while (false);
sbp.cursor = v_13;
} while (false);
return true;
}
this.setCurrent = function(word) {
sbp.setCurrent(word);
};
this.getCurrent = function() {
return sbp.getCurrent();
};
}
return new englishStemmer();
}
wh.search_stemmer = Snowball();
wh.search_baseNameList = [
 "software_distribution.html",
 "credentials.html",
 "dns_bind_installing_bind9.html",
 "overview.html",
 "dns_bind_change_default_and_global_options.html",
 "dns_bind_zones_configuration.html",
 "dns_bind_error_handling.html",
 "dns_bind_tests_forward_lookup.html",
 "dns_bind_tests_reverse_lookup.html",
 "dns_bind_test_recursive_dns_query.html",
 "dns_bind_tests.html",
 "dns_bind_mail_exchange_mx_record_configuration.html",
 "dns_bind.html",
 "ldap_browse_an_existing_ldap_server.html",
 "ldap_set_up_an_openldap_server.html",
 "ldap_populating_the_dit.html",
 "ldap_testing_a_bind_operation_as_non_admin_user.html",
 "ldap_accessing_ldap_data_by_a_mail_client.html",
 "ldap_ldap_configuration.html",
 "ldap_filter_based_search.html",
 "ldap_extending_an_existing_entry.html",
 "ldap_ldap_based_user_login.html",
 "ldap_backup_and_restore.html",
 "ldap_ldap_python.html",
 "ldap.html",
 "apache_first_steps.html",
 "apache_virtual_hosts.html",
 "apache_ssl_tls_support.html",
 "apache_ldap_authentication.html",
 "apache_mysql_database_administration.html",
 "apache_ldap_web_user_management.html",
 "apache_publish_documentation.html",
 "apache.html",
 "filecloud_prerequisites.html",
 "filecloud_package_installation.html",
 "filecloud_apache_configuration.html",
 "filecloud_associated_services.html",
 "filecloud_mariadb.html",
 "filecloud_data_folders.html",
 "filecloud_installation.html",
 "filecloud_memory_cache.html",
 "filecloud_finishing_installation.html",
 "filecloud_ldap.html",
 "filecloud_difficulties.html",
 "filecloud.html",
 "placeholder2.html",
 "index.html",
 "samba.html"
];
wh.search_titleList = [
 "1. Software distribution on the servers",
 "2. Credentials",
 "1. Installing bind9",
 "Chapter 1. Overview",
 "2. Change default and global options",
 "3. Zones configuration",
 "4. Error handling",
 "5.1. Forward lookup",
 "5.2. Reverse lookup",
 "5.3. Recursive DNS query",
 "5. Tests",
 "6. Mail exchange (MX) record configuration",
 "Chapter 2. DNS-bind",
 "1. Browse an existing LDAP Server",
 "2. Set up an OpenLdap server",
 "3. Populating the DIT",
 "4. Testing a bind operation as non - admin user",
 "5. Accessing LDAP data by a mail client",
 "6. LDAP configuration",
 "7. Filter based search",
 "8. Extending an existing entry",
 "9. LDAP based user login",
 "10. Backup and recovery / restore",
 "11. Accessing LDAP by a Python Application",
 "Chapter 3. LDAP",
 "1. First steps",
 "2. Virtual Hosts",
 "3. SSL / TLS support",
 "4. LDAP authentication",
 "5. MySQL database administration",
 "6. Providing WEB based user management to our LDAP Server",
 "7. Publish your documentation",
 "Chapter 4. Apache Web Server",
 "1. Prerequisites",
 "2. Nextcloud package installation",
 "3. Apache server configuration",
 "4. Configuring associated services",
 "5. Configuring MariaDB",
 "7. Setting up the data folders",
 "6. Nextcloud installation and configuration",
 "8. Configuring the memory cache",
 "9. Finishing the installation",
 "10. Adding LDAP support",
 "11. Difficulties",
 "Chapter 5. File cloud",
 "1. ",
 "Documentation &#34;Software Defined Infrastructure&#34; in summer term 2020 (Group 8)",
 "Chapter 6. Network file systems served by Samba"
];
wh.search_wordMap= {
"ns.plusline.d": [9],
"extens": [[25,26,27]],
"sha256": [27],
"upload": [27,[25,31]],
"mime": [35],
"addit": [[7,8,9,11],25],
"sslcertificatekeyfil": [[27,35]],
"your": [31],
"via": [[1,27]],
"these": [[22,31]],
"path": [[5,22,25,26,31]],
"describ": [15],
"bind": [5,4,[6,16],11],
"would": [27],
"a2ensit": [[25,27]],
"permiss": [38,35],
"record": [[5,11]],
"vim": [33],
"mkdir": [38],
"you": [5,28],
"ns.s.plusline.d": [9],
"ldapmodifi": [[18,20]],
"aa": [[7,8,11]],
"ad": [42,[11,26,28,31,37,39,40]],
"sure": [[25,35]],
"serv": [47],
"rsyslog.d": [18],
"automat": [36],
"an": [43,[1,13,14,20,31]],
"version": [[7,8,9,11,15,34,43]],
"betrayer.com": [19,15],
"extend": [13,[19,20]],
"as": [[15,29],[4,13,16,18,37,42]],
"befor": [40],
"folder": [35,38,[1,22,27]],
"at": [36,[5,13,33,43]],
"util": [2],
"configur": [[11,18,22],[4,25],[5,26,35,39,40,43],[17,21,27,30,31,36,37,42]],
"size": [[7,8,9,11]],
"stop": [22],
"allow-recurs": [4],
"domain": [26,[11,25,39]],
"sdi": [4],
"handl": [[6,21]],
"descript": [15],
"organ": [15],
"chapter": [[3,12,24,32,44,47]],
"be": [5,43],
"documentroot": [[25,26,27,35]],
"allowoverrid": [[25,26,27,35]],
"php-intl": [33],
"latest.zip": [34],
"least": [43],
"www-data": [35,38,39],
"manual": [[26,28],25],
"digitalsignatur": [27],
"suffici": [35],
"nonrepudi": [27],
"result": [19,23,13,[17,18,21]],
"uid": [19,13,15,23,[16,20,21]],
"see": [[4,13,16]],
"search": [19,13],
"reconnect": [13],
"releas": [34],
"bw": [27],
"libpam-ldapd": [21],
"sslengin": [[27,35]],
"by": [21,[14,25,37],[11,13,17,18,19,23,27,31,35,39,47]],
"php-gd": [33],
"term": [46],
"after": [28,[11,15,29]],
"machin": [22,21,28],
"serverauth": [27],
"connect": [23,[1,13,16,42]],
"ca": [27],
"cd": [35],
"address": [4,[5,17]],
"set": [38,14,[4,5,18,22,28,31,36,41]],
"contain": [22],
"homedirectori": [20,13],
"access.log": [[25,26,27,35]],
"abl": [[13,18,29,30]],
"cn": [15,[13,18,19,27],[20,30]],
"right": [43],
"aaaa": [9],
"figur": [43],
"the": [22,25,21,27,[35,43],[4,26],[5,13,18,38],42,[11,16,40],[6,15,28],[19,33,37,39,41],[1,2,14,17,29,30,31],[0,20,34]],
"aptitud": [14],
"renam": [38],
"organizationalperson": [19,15],
"answer": [[7,8,9,11]],
"infrastructur": [46],
"imag": [17],
"arch": [19],
"apach": [35,[0,13,15,25,29,32,36,37,41]],
"under": [30,[13,28,31,39,40,41,42]],
"config": [18,[27,30,38,39]],
"db": [5],
"did": [11],
"dc": [19,15,13,[20,23,30],[14,16,28]],
"thu": [[7,8,9]],
"de": [13,27,23],
"dig": [11,[7,8,9]],
"correct": [[38,43]],
"stud": [13],
"shadowaccount": [13],
"opcache.en": [40],
"opcache.revalidate_freq": [40],
"dn": [15,13,[18,19,20]],
"extern": [18],
"acl": [4],
"do": [[15,29,33,42,43]],
"dir": [35],
"got": [[7,8,9,11,18,19]],
"down": [21],
"dit": [[14,15]],
"named.conf.loc": [6,5],
"startup": [36],
"sites-avail": [[25,27]],
"database-us": [39],
"finish": [41],
"export": [15],
"req": [27],
"add": [20,[5,18,26]],
"named-checkconf": [6],
"which": [25,[22,26,41,43]],
"ldap-account-manag": [30],
"brows": [13],
"download.nextcloud.com": [34],
"test": [15,[10,16,21,25]],
"need": [[5,25,26]],
"chown": [38,22,35],
"ldif": [[13,22],[19,20]],
"rcvd": [[7,8,9,11]],
"check": [[6,11]],
"sslcertificatechainfil": [[27,35]],
"authnz_ldap": [28],
"respect": [[13,15]],
"ldapsearch": [19,13],
"php-curl": [33],
"success": [19,13,[21,25]],
"adjust": [[35,39,40]],
"final": [[27,42]],
"http": [30],
"activ": [[27,42]],
"sdi8b.mi.hdm-stuttgart.de.conf": [25],
"webmast": [[25,26,27,35]],
"local4": [18],
"trust": [4,[27,39]],
"some": [35],
"virtual": [26],
"fi": [38],
"php-simplexml": [33],
"for": [27,[25,35],[18,19,26,43],[1,4,5,11,13,16,17,28,31,37]],
"cname": [5],
"ldap.log": [18],
"content": [[25,27]],
"miss": [38],
"database-pass": [39],
"prevent": [21],
"phpmyadmin": [29,[0,1]],
"accomplish": [25],
"softwar": [19,15,0,[16,20,23,46]],
"load": [[5,27]],
"stuttgart": [27],
"nscd": [21],
"root": [1,[0,14,37,38]],
"scope": [13,19],
"combin": [[25,26,27,35]],
"client": [17],
"end": [38],
"hard": [43],
"just": [13,37],
"flci77iqx": [18],
"over": [1],
"owner": [22],
"modifi": [20],
"cakey": [27],
"otherwis": [5],
"subjectaltnam": [27],
"env": [35],
"dnssec-en": [4],
"ldap.conf": [13],
"retri": [5],
"home": [25,[27,35],31,13,20],
"michael": [13,46],
"with": [19,[25,27],[13,18,42],[11,20],[15,16,22,28,29,34,37,39,41,43]],
"slapd.conf": [18],
"certif": [27,35],
"msec": [[7,8,9,11]],
"publish": [31],
"there": [43],
"xmlmind": [25],
"well": [11],
"betray": [[15,19],[20,30],[14,16,23,28]],
"setup": [[21,29,35]],
"restor": [22],
"tls": [27],
"grant": [[25,27,35],[26,31,37]],
"directori": [25,[27,35,38],26,[28,31],[4,13,15,22]],
"prompt": [27],
"listen-on": [4],
"backup": [22],
"expert": [43],
"sdi8b.mi.hdm-stuttgart.de-ssl": [27],
"told": [21],
"bin": [13,38],
"openldap": [22,14],
"ns.heise.d": [9],
"desir": [[18,25]],
"occ": [[38,39]],
"retyp": [43],
"number": [[5,13]],
"e1ntsef9ovnyte5xnyttrdd1awxbmxp0ufbmws9gbenpnzdpuxg": [15],
"ca-csr.conf": [27],
"identifi": [37],
"variabl": [40],
"hdm-stuttgart": [13,23],
"specifi": [18],
"id": [[7,8,9,11,21]],
"https": [[27,31,33,34,41]],
"write": [18],
"if": [38],
"order": [26,25],
"newli": [26],
"creat": [27,[18,26],38,[1,16,20,22,25,28,37,42]],
"python": [23],
"il": [19],
"in": [9,5,[11,25],[7,8,42],[4,26],[13,27,43],[15,17,18,21,30,46]],
"treesuffix": [30],
"mod-php": [33],
"made": [[22,35]],
"ip": [4],
"php-xmlwriter": [33],
"dns": [4,27,[0,2,9,11,13,26]],
"anonym": [13],
"organizationalrol": [15],
"index": [[25,26,27,35]],
"is": [25,[4,5,31,43]],
"connection.simple_bind_": [23],
"php-mysql": [33],
"it": [38,[16,18,20,42,43],[2,5,22,26,29,34]],
"manag": [[29,30]],
"script": [38,39],
"exit": [37],
"system": [[18,21,33,37,47]],
"field": [13],
"loginshel": [13],
"invalid": [21],
"doc": [25,31,26,[27,35]],
"cmd": [[7,8,9,11]],
"connection.unbind": [23],
"php-zip": [33],
"status": [[7,8,9,11]],
"numrespons": [19,13],
"server": [[4,22],27,[0,11,35],5,[1,13,14,28],[2,7,8,9,29,36],[15,17,21,26,30,32,34,37,39,41,42]],
"d1ce": [9],
"other": [16],
"valu": [[18,19]],
"pprint": [23],
"enrol": [13],
"hdmstudent": [13],
"increas": [5],
"save": [5],
"paramet": [22,13],
"complete-nc-installation-on-debian": [33],
"login": [41,[18,21,29,42]],
"local": [[26,40]],
"summer": [46],
"mention": [5],
"valid": [27,4],
"slapd.d": [22],
"vogt": [46],
"file": [[5,18,21,22,25,26],27,[1,13,20,31,33,35,38,39,40,44,47]],
"interfac": [30],
"top": [15,19],
"too": [13],
"search_bas": [23],
"locat": [25,31],
"keyusag": [27],
"have": [5],
"rootca.pem": [27],
"share": [[1,25,26]],
"sdi8b.csr": [27],
"givennam": [[15,19]],
"database-nam": [39],
"map": [[5,35]],
"libapache2": [33],
"server_uri": [23],
"avail": [31],
"extfil": [27],
"question": [[7,8,9,11]],
"may": [[7,8,9,11]],
"add_olcrootpw.ldif": [18],
"forward": [4,[5,7,41]],
"auth-nxdomain": [4],
"could": [42,[11,13,16,27,38,41]],
"trusted_domain": [39],
"cach": [[5,40],[4,21]],
"manual.mi.hdm-stuttgart.d": [26],
"url": [31],
"dataencipher": [27],
"notic": [43],
"sdi8b.crt": [27,35],
"doc.conf": [28],
"genrsa": [27],
"exampl": [[13,17,25,26]],
"php": [43,[39,40]],
"com": [19,15,[20,30],[14,16,23,28]],
"instal": [33,25,[2,14,29,39],[30,34,41],[13,21,35,42,43]],
"subnet": [5],
"replica": [[0,22]],
"soa": [5],
"mail": [11,[13,15,17,19]],
"php-mcrypt": [33],
"use": [[13,22],[1,11,14,15,16,17,19,21,25,26,29,30,33,35,37]],
"db.mi.hdm-stuttgart.d": [5,11],
"ns.pop-hannover.d": [9],
"sign": [27],
"remot": [18],
"while": [43],
"reconfigur": [13],
"objectclass": [15,13,19,20],
"correspond": [[26,28]],
"admin-pass": [39],
"userpassword": [15],
"second": [[16,22]],
"mode": [4],
"that": [[25,43],[5,11,13,21,27,35,38]],
"sd7uila1ztppli": [18],
"index.php": [41],
"webserv": [29],
"olcdatabas": [18],
"config.ldif": [22],
"etc": [5,27,[22,35],[4,6],[11,13,18,21,25,28,40]],
"usr": [[25,26]],
"find": [38,13],
"www": [38,35,25,[26,27],[34,39]],
"host": [26,[5,35]],
"lam": [30],
"outdat": [43],
"mi": [27,43],
"ldapv3": [13,19],
"sdi8b-crs.conf": [27],
"all": [[19,25,27,35],[13,26,43],[18,22,31,33,37]],
"administr": [[15,29]],
"new": [[27,35],[5,18]],
"entri": [[11,19,20,26]],
"mi.hdm-stuttgart.d": [5,11,[7,13],8,[23,42]],
"author": [[7,8,9,11]],
"opcod": [[7,8,9,11]],
"htgroup": [38],
"difficult": [[13,43]],
"zhnnb2lqczk4ji8om2hun2yzuisjmymrwqcokcknej05acknoxpoyzg5n3o3": [15],
"mv": [[34,38]],
"mx": [11],
"fill": [18],
"revers": [[5,8]],
"tool": [13],
"x509": [27],
"servic": [[6,22],[4,11,18,27,36,41]],
"config.php": [39],
"task": [43,[11,21,33,35,37]],
"www8": [5],
"were": [[13,18,21,27,29,30,43]],
"rewrit": [35],
"updat": [38,[4,25,30]],
"header": [[7,8,9,11,35]],
"therefor": [35],
"nikla": [46],
"subtre": [13,19],
"modify_bean.ldif": [20],
"basic": [28],
"pop-hannover.net": [9],
"no": [[4,27],1],
"expir": [5],
"p4": [[7,8,9,11]],
"websit": [25],
"apache_log_dir": [[25,26,27,35]],
"ns": [9,5,[7,8,11]],
"authldapurl": [28],
"keyencipher": [27],
"php-json": [33],
"tsl": [27],
"vanhe": [46],
"nv012": [25,[26,27,35]],
"error.log": [[25,26,27,35]],
"sql": [37],
"dialog": [14],
"reload": [[4,6],[5,11]],
"execut": [38,[6,13,18,21,29,37,39]],
"ipv4": [[4,5]],
"hdm-stuttgart.d": [13,11],
"ldap.scope_onelevel": [23],
"and": [22,[1,4,18,27,29,38,42,43],[20,21,26,36],[0,2,6,13,16,19,25,28,30,31,34,35,37,39,41]],
"ipv6": [4],
"of": [[35,43],[16,22,26],[4,5,21,25,27]],
"dpkg-reconfigur": [[14,29]],
"chmod": [38],
"possibl": [[38,42]],
"backend": [42],
"dump": [15],
"attr": [23],
"ani": [4],
"gidnumb": [20,13],
"make": [[25,42,43]],
"on": [22,28,[0,4,15,21,27,35,37,43]],
"opcache.enable_c": [40],
"sdi8bnextcloudadminpassword": [[1,39]],
"skobowski": [13,46],
"ann": [[15,19]],
"purpos": [25],
"or": [19],
"pseudosect": [[7,8,9,11]],
"e68": [9],
"ou": [15,19,23,[16,20],[13,27]],
"accord": [20],
"rsyslog": [18],
"ttl": [5],
"master": [5],
"betrayerorg": [15],
"sdi8b.key": [27,35],
"vennam": [19],
"satement": [37],
"ncpath": [38],
"ssh": [1],
"bind9": [2,[4,6]],
"ssl": [27,35],
"wasn\'t": [13],
"cover": [35],
"password": [1,[16,29]],
"necessari": [[21,28,33,35]],
"search_filt": [23],
"slapadd": [22],
"state": [42],
"php.ini": [40],
"they": [27],
"app": [[38,42,43]],
"qr": [[7,8,9,11]],
"apt": [33,25,[2,29,30]],
"edit": [25],
"inetorgperson": [19,[13,15]],
"them": [[26,27,36]],
"then": [38,[13,22],[25,27],[6,18,19,20,21,34,39,42,43]],
"each": [26,5],
"databas": [37,[18,22],[0,29,36,39]],
"ra": [[7,8,9,11]],
"php-xml": [33],
"node": [27],
"rd": [[7,8,9,11]],
"includ": [26],
"passwd": [21],
"letter": [19],
"a2enmod": [35,28,27],
"php-mbstring": [33],
"customlog": [[25,26,27,35]],
"sub": [19,13],
"access": [25,[1,17,18,23,26,27,28,29]],
"document": [25,31,[5,46]],
"ztnodfpevjlzvmhltdjkbfzrrjjurfjftms5ce1gukxjrghqttnvdlluwlfa": [15],
"global": [4,[7,8,9,11]],
"mainten": [39],
"two": [43],
"opcache.interned_strings_buff": [40],
"default": [4,25],
"current": [43],
"found": [[7,8,9,11]],
"usernam": [[1,25,29,42]],
"sh": [13],
"are": [28],
"defin": [[19,46]],
"sn": [[13,15,19]],
"sudo": [[33,39]],
"so": [[27,29,37,38]],
"key": [27,1],
"email": [17],
"latest": [34],
"redirect": [[25,26]],
"st": [27],
"stat": [18],
"changetyp": [20],
"one": [[16,22]],
"sslcertificatefil": [[27,35]],
"reinstal": [43],
"refresh": [5],
"cest": [[7,8,9,11]],
"call": [25],
"mariadb-serv": [[29,33]],
"googl": [4],
"ownership": [35],
"oper": [16],
"to": [26,18,[21,25],[5,22,27,28,43],[4,29,31,33,35,38,42],[2,6,13,30,41],[11,14,17,20,34,36,37,39,40]],
"v3": [27],
"thing": [33],
"but": [[16,43]],
"olcrootpw": [18],
"smith": [19,15],
"lib": [[22,30]],
"afterward": [14],
"organizationalunit": [15,19],
"had": [[2,13,35,43]],
"run": [[2,4,14,25,28]],
"either": [19],
"authtyp": [28],
"sdi8b.mi.hdm-stuttgart.d": [27,35,25,41,[0,1,23,28,29,30,31,39]],
"sever": [43],
"index.html": [25],
"mysql": [[0,29,37,39]],
"up": [[5,14,22,28,31,36,38,41]],
"written": [43],
"keyword": [[25,26]],
"those": [43],
"mv068": [[25,27,35]],
"www.manual.mi.hdm-stuttgart.d": [26],
"recurs": [4,9],
"difficulti": [43],
"actual": [22],
"last": [[11,27]],
"this": [27,[19,28,42],[4,5,15,21,31,33,36,43]],
"opcache.memory_consumpt": [40],
"dure": [[21,42]],
"look": [15],
"alia": [[25,35],27,[26,31]],
"opcache.max_accelerated_fil": [40],
"daemon": [21],
"root.mi.hdm-stuttgart.d": [5],
"hallo": [25],
"distinguished_nam": [27],
"opt": [[7,8,9,11]],
"nc_data": [38],
"vi": [38],
"privat": [27,4],
"print0": [38],
"vm": [21],
"name": [5,13],
"subdomain": [26],
"guid": [[29,33]],
"page": [[25,38,43]],
"support": [42,27],
"sinc": [4],
"allow": [[1,4]],
"next": [[5,21,22,25,26,27,29]],
"userlist": [13,23],
"jectclass": [19],
"systemctl": [36,41],
"import": [23,4],
"htuser": [38],
"show": [[17,21,42]],
"admin": [[18,30],[15,42],[16,20]],
"kjyzuhbpq": [15],
"effort": [43],
"devel": [19,15,[16,20,23]],
"non": [16],
"servernam": [26,[25,27,35]],
"everi": [26],
"we": [27,25,13,[21,22],[18,29,35,38,42],[4,26],[5,11,30],[6,14,16,19,20,28,37,39,40,41,43],[1,2,15,17,31,33,34,36]],
"printf": [38],
"comput": [26],
"not": [[5,11,16,35,43]],
"privileg": [37],
"flush": [37],
"sdi8a.mi.hdm-stuttgart.d": [7,5,[0,1,8,28]],
"appli": [[4,6,20]],
"florian": [13,46],
"queri": [9,[7,8,11],19,[4,21]],
"debian": [[7,8,9,11]],
"now": [22,[13,16,18,27,28,31,41,43]],
"help.nextcloud.com": [33],
"samba": [[1,47]],
"enabl": [36,[4,18,21,25,27,28,35]],
"overview": [[1,3]],
"middl": [43],
"previous": [[35,37]],
"associ": [36],
"yes": [4],
"xarg": [38],
"again": [43],
"was": [[25,43],[13,33],[11,19,21,26,28,35,41]],
"start": [19,[22,36]],
"distribut": [0],
"php-imagick": [33],
"ptr": [[5,8]],
"hdm": [[23,27,42],[4,13,43]],
"chang": [4,[5,26],[6,21]],
"popul": [15],
"financi": [15],
"step": [25],
"bash": [38],
"time": [[5,7,8,9,11]],
"noerror": [[7,8,9,11]],
"mark": [4],
"base": [[13,19],[21,30]],
"studio": [[13,15]],
"sdi8b-csr.conf": [27],
"mod": [35],
"shadow": [21],
"authnam": [28],
"heise.d": [9],
"errorlog": [[25,26,27,35]],
"type": [38,5,13],
"in-addr.arpa": [8,5],
"ns2": [9],
"when": [[7,8,9,11]],
"mon": [11],
"galleri": [42],
"jim": [19,15],
"consist": [25],
"sdi8bsamba": [1],
"ns8": [5,[7,8,11]],
"sdi8bnextclouddbpassword": [[1,37,39]],
"posixaccount": [[13,20]],
"case": [25],
"connection.search_": [23],
"give": [[1,22,35]],
"applic": [1,23],
"numentri": [19,13],
"goal": [28],
"var": [38,35,25,[18,26,27,34],[4,22,30,39]],
"work": [[16,43]],
"modul": [[27,28]],
"exist": [[13,20,37]],
"serveradmin": [[25,26,27,35]],
"memori": [40],
"listen-on-v6": [4],
"sdi8": [23],
"authent": [28],
"slide": [15],
"openssl": [27],
"tabl": [1,0],
"flag": [[7,8,9,11]],
"apache2": [25,27,35,[28,36],[26,33,40,41]],
"log": [[18,42],30],
"lam.conf": [30],
"wget": [34],
"ldap1": [13,[23,42]],
"php-xmlreader": [33],
"copi": [38],
"requir": [35,[25,27],[26,28,31,43]],
"unzip": [[33,34]],
"our": [25,[13,27],[21,22,35],[28,30],[17,18,26,29,31,36,37,42],[1,4,11,15,39,41]],
"freedoc": [15],
"out": [27,43],
"followsymlink": [[25,26,27,35]],
"web": [30,[0,27,28,32]],
"hdmaccount": [13],
"req_extens": [27],
"theme": [38],
"packag": [25,[13,21,33,34,43]],
"sult": [19],
"gruppen": [21],
"hdmcategori": [13],
"restart": [36,41,[18,21,22,27,28]],
"tutori": [[38,43]],
"authbasicprovid": [28],
"deamon": [21],
"token": [13],
"ssha": [18],
"ldap.initi": [23],
"filter": [13,19],
"usag": [21],
"site": [27,[31,35]],
"serveralia": [26,[25,27,35]],
"sambashar": [1],
"advanc": [43],
"first": [22,[13,18,25,27,28,33,39]],
"msg": [[7,8,9,11]],
"dcobject": [15],
"shut": [21],
"ldapi": [18],
"rootca.key": [27],
"data": [22,38,21,[15,17]],
"htaccess": [38],
"own": [[25,27]],
"credenti": [1,[28,29,30,42]],
"ldap-util": [13],
"ncdata": [38],
"section": [[7,8,9,11],[4,40]],
"separ": [26],
"listen": [4],
"fs120": [13,[25,27,35]],
"cloud": [[33,44]],
"extendedkeyusag": [27],
"alt_nam": [27],
"major": [43],
"tab": [43],
"ldap": [23,21,28,13,[22,42],[0,1,17,30,43],[15,18,20,24]],
"zone": [5,11],
"simpl": [28],
"eduperson": [13],
"from": [[22,23,27],[1,4,35,37,38]],
"html": [25],
"slapd": [[14,22]],
"depart": [19,15,[16,20,23]],
"replac": [25],
"day": [27],
"bean": [19,15,[16,20],[21,23]],
"group": [[21,42,46]],
"localhost": [[1,25,26,27,35,37,39]],
"olclogfil": [18],
"thunderbird": [17],
"profil": [16],
"ubuntu": [25],
"www.sdi8b.mi.hdm-stuttgart.d": [[25,27,35]],
"kind": [43],
"onli": [4,[1,42]],
"nc_perm.sh": [38],
"dns-bind": [12],
"edn": [[7,8,9,11]],
"class-c": [5],
"mistud": [23],
"olcloglevel": [18],
"person": [19,15,1],
"exchang": [11],
"chain.txt": [[27,35]],
"achiev": [[21,28]],
"option": [4,[7,8,9,11,25,26,27,35]],
"here": [[5,28]],
"udp": [[7,8,9,11]],
"request": [[13,27],[4,19]],
"gid": [21],
"line": [[21,28,31]],
"opcache.save_com": [40],
"generat": [27,35],
"error": [6],
"slapcat": [22],
"point": [36],
"network": [[4,47]],
"stretch-and-manual-upd": [33],
"array": [39],
"browser": [[25,27]],
"rootus": [38],
"ncadmin": [[1,39]],
"messag": [18],
"recoveri": [22],
"prerequisit": [33],
"easi": [13],
"provid": [[21,25,27,28,30]],
"virtualhost": [[25,26,27,35]],
"nextcloud": [35,39,[34,37],[38,41],[1,43],[0,33]],
"sdi8b": [1,[21,29,30]],
"lookup": [5,[7,8,17]],
"conf-avail": [28],
"sdi8a": [1,[20,21]],
"process": [[21,42]],
"move": [[34,38]],
"named.conf.opt": [4],
"will": [5],
"cacreateseri": [27],
"mx1": [11],
"attribut": [19,18,20],
"admin-us": [39],
"also": [35],
"follow": [[1,13,15,19,21,28,29,33,37,40,42]],
"instead": [35],
"command": [[22,25],[6,13,43]],
"differ": [13],
"sdidoc": [25,[27,35],31],
"mariadb": [36,[29,37],1],
"nsswitch.conf": [21],
"serial": [5],
"various": [1],
"uidnumb": [20,13],
"data.ldif": [22],
"simplesecurityobject": [15],
"user": [[16,22,42],[13,21,28],[18,19,30,35,37]],
"negat": [5]
};
