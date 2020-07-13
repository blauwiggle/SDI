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
 "dns_bind_change_default_and_global_options.html",
 "dns_bind_installing_bind9.html",
 "dns_bind_error_handling.html",
 "dns_bind_zones_configuration.html",
 "dns_bind_tests_forward_lookup.html",
 "dns_bind_tests_reverse_lookup.html",
 "dns_bind_test_recursive_dns_query.html",
 "dns_bind_tests.html",
 "dns_bind.html",
 "dns_bind_mail_exchange_mx_record_configuration.html",
 "ldap_browse_an_existing_ldap_server.html",
 "ldap_set_up_an_openldap_server.html",
 "ldap_populating_the_dit.html",
 "ldap_testing_a_bind_operation_as_non_admin_user.html",
 "ldap_accessing_ldap_data_by_a_mail_client.html",
 "ldap_ldap_configuration.html",
 "ldap_extending_an_existing_entry.html",
 "ldap_filter_based_search.html",
 "ldap_ldap_based_user_login.html",
 "ldap_backup_and_restore.html",
 "ldap.html",
 "ldap_ldap_python.html",
 "apache_first_steps.html",
 "apache_virtual_hosts.html",
 "apache_ldap_authentication.html",
 "apache_ssl_tls_support.html",
 "apache_ldap_web_user_management.html",
 "apache_mysql_database_administration.html",
 "apache_publish_documentation.html",
 "apache.html",
 "filecloud_prerequisites.html",
 "filecloud_apache_configuration.html",
 "filecloud_package_installation.html",
 "filecloud_associated_services.html",
 "filecloud_mariadb.html",
 "filecloud_data_folders.html",
 "filecloud_installation.html",
 "filecloud_finishing_installation.html",
 "filecloud_memory_cache.html",
 "filecloud.html",
 "filecloud_difficulties.html",
 "filecloud_ldap.html",
 "placeholder2.html",
 "samba.html",
 "index.html"
];
wh.search_titleList = [
 "2. Change default and global options",
 "1. Installing bind9",
 "4. Error handling",
 "3. Zones configuration",
 "5.1. Forward lookup",
 "5.2. Reverse lookup",
 "5.3. Recursive DNS query",
 "5. Tests",
 "Chapter 1. DNS-bind",
 "6. Mail exchange (MX) record configuration",
 "1. Browse an existing LDAP Server",
 "2. Set up an OpenLdap server",
 "3. Populating the DIT",
 "4. Testing a bind operation as non - admin user",
 "5. Accessing LDAP data by a mail client",
 "6. LDAP configuration",
 "8. Extending an existing entry",
 "7. Filter based search",
 "9. LDAP based user login",
 "10. Backup and recovery / restore",
 "Chapter 2. LDAP",
 "11. Accessing LDAP by a Python Application",
 "1. First steps",
 "2. Virtual Hosts",
 "4. LDAP authentication",
 "3. SSL / TLS support",
 "6. Providing WEB based user management to your LDAP Server",
 "5. MySQL database administration",
 "7. Publish your documentation",
 "Chapter 3. Apache Web Server",
 "1. Prerequisites",
 "3. Apache server configuration",
 "2. Nextcloud package installation",
 "4. Configuring associated services",
 "5. Configuring MariaDB",
 "7. Setting up the data folders",
 "6. Nextcloud installation and configuration",
 "9. Finishing the installation",
 "8. Configuring the memory cache",
 "Chapter 4. File cloud",
 "11. Difficulties",
 "10. Adding LDAP support",
 "1. ",
 "Chapter 5. Network file systems served by Samba",
 "Documentation &#34;Software Defined Infrastructure&#34; in summer term 2020 (Group 8)"
];
wh.search_wordMap= {
"mysql-serv": [27],
"ns.plusline.d": [6],
"extens": [[22,23,25]],
"sha256": [25],
"upload": [25,[22,28]],
"mime": [31],
"addit": [[4,5,6,9],22],
"sslcertificatekeyfil": [[25,31]],
"your": [[26,28]],
"den": [21],
"via": [25],
"these": [[19,28]],
"path": [[3,19,22,23,28]],
"describ": [12],
"bind": [3,0,[2,13],9],
"would": [25],
"a2ensit": [[22,25]],
"permiss": [35,31],
"record": [[3,9]],
"vim": [30],
"mkdir": [35],
"you": [3,24],
"ns.s.plusline.d": [6],
"ldapmodifi": [[15,16]],
"aa": [[4,5,9]],
"ad": [41,[9,23,24,28,34,36,38]],
"sure": [[22,31]],
"serv": [43],
"rsyslog.d": [15],
"automat": [33],
"version": [[4,5,6,9,12,32,40]],
"an": [40,[10,11,16,28]],
"betrayer.com": [17,12],
"extend": [10,[16,17]],
"as": [[12,27],[0,10,13,15,34,41]],
"befor": [38],
"at": [33,[3,10,30,40]],
"folder": [31,35,[19,25]],
"configur": [[9,15,19],[0,22],[3,23,31,36,38,40],[14,18,25,26,28,33,34,41]],
"util": [1],
"size": [[4,5,6,9]],
"stop": [19],
"allow-recurs": [0],
"domain": [23,[9,22,36]],
"sdi": [0],
"handl": [[2,18]],
"descript": [12],
"organ": [12],
"chapter": [[8,20,29,39,43]],
"be": [3,40],
"documentroot": [[22,23,25,31]],
"allowoverrid": [[22,23,25,31]],
"php-intl": [30],
"latest.zip": [32],
"least": [40],
"ergebni": [21],
"www-data": [31,35,36],
"manual": [[23,24],22],
"digitalsignatur": [25],
"suffici": [31],
"nonrepudi": [25],
"result": [17,10,[14,15,18]],
"uid": [17,10,12,[13,16,18]],
"see": [[0,10,13]],
"search": [17,10],
"reconnect": [10],
"skipt": [21],
"releas": [32],
"bw": [25],
"libpam-ldapd": [18],
"sslengin": [[25,31]],
"by": [18,[11,21,22,34],[9,10,14,15,17,25,28,31,36,43]],
"php-gd": [30],
"term": [44],
"after": [24,[9,12,27]],
"machin": [19,18,24],
"serverauth": [25],
"connect": [[10,13,41]],
"ca": [25],
"cd": [31],
"address": [0,[3,14]],
"set": [35,11,[0,3,15,19,24,28,33,37]],
"contain": [19],
"homedirectori": [16,10],
"access.log": [[22,23,25,31]],
"abl": [[10,15]],
"cn": [12,[10,15,17,25],[16,26]],
"right": [40],
"aaaa": [6],
"figur": [40],
"the": [19,22,18,25,[31,40],[0,23],[3,10,15,35],41,[9,13,38],[2,12,24],[17,30,34,36,37],[1,11,14,26,27,28],[16,32]],
"aptitud": [11],
"renam": [35],
"organizationalperson": [17,12],
"answer": [[4,5,6,9]],
"infrastructur": [44],
"imag": [14],
"arch": [17],
"apach": [31,[10,12,22,27,29,33,34,37]],
"under": [26,[10,24,28,36,37,38,41]],
"config": [15,[25,26,35,36]],
"db": [3,27],
"did": [9],
"dc": [17,12,10,[16,26],[11,13,24]],
"thu": [[4,5,6]],
"de": [10,25],
"dig": [9,[4,5,6]],
"zugriff": [21],
"correct": [[35,40]],
"stud": [10],
"shadowaccount": [10],
"opcache.en": [38],
"opcache.revalidate_freq": [38],
"dn": [12,10,[15,16,17]],
"extern": [15],
"acl": [0],
"do": [[12,27,30,40,41]],
"dir": [31],
"got": [[4,5,6,9,15,17]],
"down": [18],
"dit": [[11,12]],
"named.conf.loc": [2,3],
"startup": [33],
"sites-avail": [[22,25]],
"database-us": [36],
"finish": [37],
"export": [12],
"req": [25],
"named-checkconf": [2],
"add": [16,[3,15,23]],
"which": [22,[19,23,37,40]],
"ldap-account-manag": [26],
"brows": [10],
"download.nextcloud.com": [32],
"test": [12,[7,13,18,22]],
"need": [[3,22,23,26,27]],
"chown": [35,19,31],
"ldif": [[10,19],[16,17]],
"rcvd": [[4,5,6,9]],
"check": [[2,9]],
"sslcertificatechainfil": [[25,31]],
"authnz_ldap": [24],
"respect": [[10,12]],
"ldapsearch": [17,10],
"php-curl": [30],
"success": [17,10,[18,22]],
"adjust": [[31,36,38]],
"final": [[25,41]],
"http": [26],
"activ": [[25,41]],
"sdi8b.mi.hdm-stuttgart.de.conf": [22],
"webmast": [[22,23,25,31]],
"local4": [15],
"trust": [0,[25,36]],
"some": [31],
"virtual": [23],
"fi": [35],
"php-simplexml": [30],
"for": [25,[22,31],[15,17,23,40],[0,3,9,10,13,14,24,28,34]],
"cname": [3],
"ldap.log": [15],
"content": [[22,25]],
"miss": [35],
"database-pass": [36],
"prevent": [18],
"phpmyadmin": [27],
"accomplish": [22],
"load": [[3,25]],
"softwar": [17,12,[13,16,44]],
"stuttgart": [25],
"nscd": [18],
"scope": [10,17],
"root": [[11,34,35]],
"combin": [[22,23,25,31]],
"client": [14],
"end": [35],
"hard": [40],
"just": [10,34],
"flci77iqx": [15],
"owner": [19],
"modifi": [16],
"cakey": [25],
"otherwis": [3],
"subjectaltnam": [25],
"env": [31],
"dnssec-en": [0],
"ldap.conf": [10],
"retri": [3],
"home": [22,[25,31],28,10,16],
"michael": [10,44],
"with": [17,[22,25],[10,15,41],[9,16],[12,13,19,24,27,32,34,36,37,40]],
"slapd.conf": [15],
"certif": [25,31],
"msec": [[4,5,6,9]],
"publish": [28],
"there": [40],
"xmlmind": [22],
"well": [9],
"betray": [[12,17],[16,26],[11,13,24]],
"setup": [[18,27,31]],
"restor": [19],
"tls": [25],
"grant": [[22,25,31],[23,28,34]],
"directori": [22,[25,31,35],23,[24,28],[0,10,12,19]],
"prompt": [25],
"listen-on": [0],
"backup": [19],
"expert": [40],
"sdi8b.mi.hdm-stuttgart.de-ssl": [25],
"told": [18],
"bin": [10,35],
"openldap": [19,11],
"ns.heise.d": [6],
"desir": [[15,22]],
"occ": [[35,36]],
"retyp": [40],
"number": [[3,10]],
"e1ntsef9ovnyte5xnyttrdd1awxbmxp0ufbmws9gbenpnzdpuxg": [12],
"ca-csr.conf": [25],
"identifi": [34],
"variabl": [38],
"hdm-stuttgart": [10],
"specifi": [15],
"id": [[4,5,6,9,18]],
"https": [[25,28,30,32,37]],
"write": [15],
"if": [35],
"order": [23,22],
"newli": [23],
"creat": [25,[15,23],35,[13,16,19,22,24,34,41]],
"python": [21],
"il": [17],
"in": [6,3,[9,22],[4,5,41],[0,23],[10,25,40],[12,14,15,18,26,44]],
"treesuffix": [26],
"mod-php": [30],
"made": [[19,31]],
"ip": [0],
"php-xmlwriter": [30],
"dns": [0,25,[1,6,9,10,23]],
"anonym": [10],
"organizationalrol": [12],
"index": [[22,23,25,31]],
"is": [22,[0,3,28,40]],
"php-mysql": [30],
"it": [35,[13,15,16,40,41],[1,3,19,23,27,32]],
"manag": [[26,27]],
"script": [35,36],
"exit": [34],
"system": [[15,18,30,34,43]],
"field": [10],
"loginshel": [10],
"invalid": [18],
"doc": [22,28,23,[25,31]],
"cmd": [[4,5,6,9]],
"php-zip": [30],
"status": [[4,5,6,9]],
"numrespons": [17,10],
"server": [[0,19],25,[9,31],3,[10,11,24],[1,4,5,6,27,33],[12,14,18,23,26,29,32,34,36,37,41]],
"d1ce": [6],
"other": [13],
"valu": [[15,17]],
"enrol": [10],
"hdmstudent": [10],
"increas": [3],
"save": [3],
"paramet": [19,10],
"complete-nc-installation-on-debian": [30],
"login": [37,[15,18,27,41]],
"local": [[23,38]],
"summer": [44],
"mention": [3],
"valid": [25,0],
"slapd.d": [19],
"vogt": [44],
"file": [[3,15,18,19,22,23],25,[10,16,26,28,30,31,35,36,38,39,43]],
"interfac": [26],
"top": [12,17],
"too": [10],
"locat": [22,[26,28]],
"keyusag": [25],
"have": [[3,26]],
"rootca.pem": [25],
"share": [[22,23]],
"sdi8b.csr": [25],
"givennam": [[12,17]],
"database-nam": [36],
"map": [[3,31]],
"libapache2": [30],
"avail": [28],
"extfil": [25],
"question": [[4,5,6,9]],
"may": [[4,5,6,9]],
"add_olcrootpw.ldif": [15],
"forward": [0,[3,4,37]],
"auth-nxdomain": [0],
"could": [41,[9,10,13,25,35,37]],
"trusted_domain": [36],
"cach": [[3,38],[0,18]],
"manual.mi.hdm-stuttgart.d": [23],
"url": [28],
"dataencipher": [25],
"notic": [40],
"doc.conf": [24],
"sdi8b.crt": [25,31],
"genrsa": [25],
"exampl": [[10,14,22,23]],
"php": [40,[36,38]],
"com": [17,12,[16,26],[11,13,24]],
"instal": [30,22,[1,11,36],[26,27,32,37],[10,18,31,40,41]],
"subnet": [3],
"soa": [3],
"mail": [9,[10,12,14,17]],
"replica": [19],
"php-mcrypt": [30],
"use": [[10,19],[9,11,12,13,14,17,18,22,23,26,27,30,31,34]],
"db.mi.hdm-stuttgart.d": [3,9],
"ns.pop-hannover.d": [6],
"sign": [25],
"remot": [15],
"while": [40],
"reconfigur": [10],
"objectclass": [12,10,17,16],
"correspond": [[23,24]],
"admin-pass": [36],
"userpassword": [12],
"second": [[13,19]],
"mode": [0],
"that": [[22,40],[3,9,10,18,25,31,35]],
"sd7uila1ztppli": [15],
"index.php": [37],
"credent": [27],
"webserv": [27],
"olcdatabas": [15],
"config.ldif": [19],
"etc": [3,25,[19,31],[0,2],[9,10,15,18,22,24,38]],
"usr": [[22,23]],
"find": [35,10],
"www": [35,31,22,[23,25],[32,36]],
"host": [23,31],
"lam": [26],
"outdat": [40],
"mi": [25,40],
"ldapv3": [10,17],
"sdi8b-crs.conf": [25],
"all": [[17,22,25,31],[10,23,40],[15,19,28,30,34]],
"administr": [[12,27]],
"new": [[25,31],[3,15]],
"entri": [[9,16,17,23]],
"mi.hdm-stuttgart.d": [3,9,[4,10],5,41],
"author": [[4,5,6,9]],
"opcod": [[4,5,6,9]],
"htgroup": [35],
"difficult": [[10,40]],
"zhnnb2lqczk4ji8om2hun2yzuisjmymrwqcokcknej05acknoxpoyzg5n3o3": [12],
"mv": [[32,35]],
"mx": [9],
"fill": [15],
"revers": [[3,5]],
"tool": [10],
"x509": [25],
"servic": [[2,19],[0,9,15,25,33,37]],
"config.php": [36],
"task": [40,[9,18,30,31,34]],
"www8": [3],
"were": [[10,15,18,25,40]],
"rewrit": [31],
"updat": [35,[0,22,26]],
"header": [[4,5,6,9,31]],
"therefor": [31],
"nikla": [44],
"subtre": [10,17],
"modify_bean.ldif": [16],
"basic": [24],
"pop-hannover.net": [6],
"no": [[0,25]],
"expir": [3],
"p4": [[4,5,6,9]],
"websit": [22],
"apache_log_dir": [[22,23,25,31]],
"ns": [6,3,[4,5,9]],
"authldapurl": [24],
"keyencipher": [25],
"php-json": [30],
"tsl": [25],
"vanhe": [44],
"nv012": [22,[23,25,31]],
"error.log": [[22,23,25,31]],
"sql": [34],
"dialog": [11],
"reload": [[0,2],[3,9]],
"execut": [35,[2,10,15,18,27,34,36]],
"ipv4": [[0,3]],
"hdm-stuttgart.d": [10,9],
"and": [19,27,[0,15,25,35,40,41],[16,18,23,33],[1,2,10,13,17,22,24,26,28,31,32,34,36,37]],
"ipv6": [0],
"of": [[31,40],[13,19,23],[0,3,18,22,25]],
"dpkg-reconfigur": [[11,27]],
"chmod": [35],
"possibl": [[35,41]],
"backend": [41],
"dump": [12],
"ani": [0],
"gidnumb": [16,10],
"für": [21],
"make": [[22,40,41]],
"on": [19,24,[0,12,18,25,31,34,40]],
"opcache.enable_c": [38],
"skobowski": [10,44],
"ann": [[12,17]],
"sdi8bnextcloudadminpassword": [36],
"purpos": [22],
"or": [17],
"pseudosect": [[4,5,6,9]],
"e68": [6],
"ou": [12,17,[13,16],[10,25]],
"accord": [16],
"rsyslog": [15],
"ttl": [3],
"master": [3],
"betrayerorg": [12],
"sdi8b.key": [25,31],
"vennam": [17],
"satement": [34],
"ncpath": [35],
"bind9": [1,[0,2]],
"ssl": [25,31],
"wasn\'t": [10],
"cover": [31],
"password": [[13,27]],
"necessari": [[18,24,30,31]],
"slapadd": [19],
"state": [41],
"php.ini": [38],
"they": [25],
"app": [[35,40,41]],
"qr": [[4,5,6,9]],
"apt": [30,22,[1,26,27]],
"edit": [22],
"want": [27],
"inetorgperson": [17,[10,12]],
"them": [[23,25,33]],
"then": [35,[10,19],[22,25],[2,15,16,17,18,32,36,40,41]],
"each": [23,3],
"ra": [[4,5,6,9]],
"databas": [34,[15,19],[27,33,36]],
"php-xml": [30],
"node": [25],
"rd": [[4,5,6,9]],
"includ": [23],
"passwd": [18],
"letter": [17],
"a2enmod": [31,24,25],
"php-mbstring": [30],
"customlog": [[22,23,25,31]],
"sub": [17,10],
"access": [[21,22],[14,15,23,24,25,27]],
"document": [22,28,[3,44]],
"ztnodfpevjlzvmhltdjkbfzrrjjurfjftms5ce1gukxjrghqttnvdlluwlfa": [12],
"global": [0,[4,5,6,9]],
"mainten": [36],
"two": [40],
"opcache.interned_strings_buff": [38],
"default": [0,22],
"current": [40],
"found": [[4,5,6,9]],
"usernam": [[22,27,41]],
"sh": [10],
"are": [24],
"defin": [[17,44]],
"sn": [[10,12,17]],
"sudo": [[30,36]],
"so": [[25,27,34,35]],
"email": [14],
"key": [25],
"latest": [32],
"redirect": [[22,23]],
"st": [25],
"stat": [15],
"changetyp": [16],
"one": [[13,19]],
"sslcertificatefil": [[25,31]],
"reinstal": [40],
"refresh": [3],
"cest": [[4,5,6,9]],
"call": [22],
"mariadb-serv": [30],
"googl": [0],
"ownership": [31],
"oper": [13],
"to": [23,15,[18,22],[3,19,24,25,27,40],[0,26,28,30,31,35,41],[1,2,10,37],[9,11,14,16,32,33,34,36,38]],
"v3": [25],
"thing": [30],
"but": [[13,40]],
"olcrootpw": [15],
"smith": [17,12],
"lib": [[19,26]],
"skript": [21],
"afterward": [11],
"organizationalunit": [12,17],
"run": [[0,1,11,22,24,27]],
"had": [[1,10,31,40]],
"either": [17],
"authtyp": [24],
"sdi8b.mi.hdm-stuttgart.d": [25,31,22,37,[24,26,27,28,36]],
"sever": [40],
"index.html": [22],
"mysql": [27,[34,36]],
"up": [[3,11,19,24,28,33,35,37]],
"written": [40],
"keyword": [[22,23]],
"those": [40],
"mv068": [[22,25,31]],
"www.manual.mi.hdm-stuttgart.d": [23],
"recurs": [0,6],
"difficulti": [40],
"actual": [19],
"last": [[9,25]],
"this": [25,[17,24,41],[0,3,12,18,28,30,33,40]],
"opcache.memory_consumpt": [38],
"dure": [[18,41]],
"look": [12],
"alia": [[22,31],25,[23,28]],
"opcache.max_accelerated_fil": [38],
"daemon": [18],
"root.mi.hdm-stuttgart.d": [3],
"hallo": [22],
"distinguished_nam": [25],
"opt": [[4,5,6,9]],
"nc_data": [35],
"auf": [21],
"vi": [35],
"privat": [25,0],
"print0": [35],
"vm": [18],
"name": [3,10],
"subdomain": [23],
"guid": [[27,30]],
"page": [[22,35,40]],
"support": [41,25],
"sinc": [0],
"allow": [0],
"next": [[3,18,19,22,23,25,27]],
"userlist": [10],
"jectclass": [17],
"systemctl": [33,37],
"import": [0],
"htuser": [35],
"show": [[14,18,41]],
"admin": [[15,26],[12,41],[13,16]],
"kjyzuhbpq": [12],
"effort": [40],
"devel": [17,12,[13,16]],
"non": [13],
"servernam": [23,[22,25,31]],
"everi": [23],
"we": [25,22,10,[18,19],[15,27,31,35,41],[0,23],[3,9,26],[2,11,13,16,17,24,34,36,37,38,40],[1,12,14,28,30,32,33]],
"printf": [35],
"comput": [23],
"not": [[3,9,13,31,40]],
"privileg": [34],
"flush": [34],
"appli": [[0,2,16]],
"sdi8a.mi.hdm-stuttgart.d": [4,3,[5,24]],
"florian": [10,44],
"queri": [6,[4,5,9],17,[0,18]],
"debian": [[4,5,6,9]],
"now": [[19,26],[10,13,15,24,25,27,28,37,40]],
"help.nextcloud.com": [30],
"samba": [43],
"enabl": [33,[0,15,18,22,24,25,31]],
"middl": [40],
"previous": [[31,34]],
"associ": [33],
"yes": [0],
"xarg": [35],
"again": [40],
"was": [[22,40],[10,30],[9,17,18,23,24,31,37]],
"start": [17,[19,33]],
"php-imagick": [30],
"ptr": [[3,5]],
"hdm": [[21,25,41],[0,10,40]],
"chang": [0,[3,23],[2,18]],
"popul": [12],
"financi": [12],
"step": [22],
"bash": [35],
"time": [[3,4,5,6,9]],
"noerror": [[4,5,6,9]],
"mark": [0],
"base": [[10,17],[18,26]],
"studio": [[10,12]],
"sdi8b-csr.conf": [25],
"mod": [31],
"shadow": [18],
"authnam": [24],
"heise.d": [6],
"errorlog": [[22,23,25,31]],
"type": [35,3,10],
"in-addr.arpa": [5,3],
"ns2": [6],
"when": [[4,5,6,9]],
"mon": [9],
"hostnam": [3],
"galleri": [41],
"jim": [17,12],
"consist": [22],
"ns8": [3,[4,5,9]],
"sdi8bnextclouddbpassword": [[34,36]],
"posixaccount": [[10,16]],
"case": [22],
"numentri": [17,10],
"give": [[19,31]],
"applic": [21],
"goal": [24],
"var": [35,31,22,[15,23,25,32],[0,19,26,36]],
"work": [[13,40]],
"modul": [[24,25]],
"exist": [[10,16,34]],
"serveradmin": [[22,23,25,31]],
"memori": [38],
"listen-on-v6": [0],
"sdi8": [21],
"authent": [24],
"slide": [12],
"openssl": [25],
"flag": [[4,5,6,9]],
"apache2": [22,25,31,[24,33],[23,30,37,38]],
"log": [[15,41],26],
"lam.conf": [26],
"wget": [32],
"ldap1": [10,41],
"php-xmlreader": [30],
"copi": [35],
"requir": [31,[22,25],[23,24,28,40]],
"unzip": [[30,32]],
"our": [22,[10,25],[18,19,31],24,[14,15,23,26,27,28,33,34,41],[0,9,12,36,37]],
"freedoc": [12],
"out": [25,40],
"followsymlink": [[22,23,25,31]],
"web": [26,[24,25,29]],
"hdmaccount": [10],
"req_extens": [25],
"theme": [35],
"packag": [22,[10,18,30,32,40]],
"sult": [17],
"gruppen": [18],
"hdmcategori": [10],
"restart": [33,37,[15,18,19,24,25]],
"tutori": [[35,40]],
"authbasicprovid": [24],
"deamon": [18],
"token": [10],
"ssha": [15],
"filter": [10,17],
"usag": [18],
"site": [25,[28,31]],
"serveralia": [23,[22,25,31]],
"advanc": [40],
"first": [19,[10,15,22,24,25,26,30,36]],
"msg": [[4,5,6,9]],
"dcobject": [12],
"shut": [18],
"ldapi": [15],
"rootca.key": [25],
"data": [19,35,18,[12,14]],
"htaccess": [35],
"own": [[22,25]],
"ldap-util": [10],
"credenti": [[24,26,41]],
"ncdata": [35],
"section": [[4,5,6,9],[0,38]],
"separ": [23],
"listen": [0],
"fs120": [10,[22,25,31]],
"cloud": [[30,39]],
"extendedkeyusag": [25],
"alt_nam": [25],
"major": [40],
"tab": [40],
"zone": [3,9],
"ldap": [18,[21,24],10,[19,41],[14,26,40],[12,15,16,20]],
"simpl": [24],
"eduperson": [10],
"from": [[19,25],[0,31,34,35]],
"html": [22],
"slapd": [[11,19]],
"depart": [17,12,[13,16]],
"replac": [22],
"day": [25],
"bean": [17,12,[13,16],18],
"group": [[18,41,44]],
"olclogfil": [15],
"localhost": [[22,23,25,31,34,36]],
"thunderbird": [14],
"profil": [13],
"ubuntu": [22],
"www.sdi8b.mi.hdm-stuttgart.d": [[22,25,31]],
"kind": [40],
"onli": [0,41],
"nc_perm.sh": [35],
"dns-bind": [8],
"edn": [[4,5,6,9]],
"class-c": [3],
"olcloglevel": [15],
"person": [17,12],
"exchang": [9],
"chain.txt": [[25,31]],
"achiev": [[18,24]],
"option": [0,[4,5,6,9,22,23,25,31]],
"here": [[3,24]],
"udp": [[4,5,6,9]],
"request": [[10,25],[0,17]],
"gid": [18],
"line": [[18,24,28]],
"opcache.save_com": [38],
"generat": [25,31],
"error": [2],
"slapcat": [19],
"point": [33],
"network": [[0,43]],
"can": [27,26],
"stretch-and-manual-upd": [30],
"array": [36],
"browser": [[22,25]],
"rootus": [35],
"ncadmin": [36],
"messag": [15],
"recoveri": [19],
"prerequisit": [30],
"easi": [10],
"provid": [[18,22,24,25,26]],
"virtualhost": [[22,23,25,31]],
"nextcloud": [31,36,[32,34],[35,37],40,30],
"lookup": [3,[4,5,14]],
"sdi8b": [[18,26,27]],
"conf-avail": [24],
"sdi8a": [[16,18]],
"process": [[18,41]],
"move": [[32,35]],
"named.conf.opt": [0],
"will": [3],
"cacreateseri": [25],
"mx1": [9],
"attribut": [17,15,16],
"admin-us": [36],
"also": [31],
"follow": [[10,12,17,18,24,27,30,34,38,41]],
"instead": [31],
"command": [[19,22],[2,10,40]],
"differ": [10],
"sdidoc": [22,[25,31],28],
"mariadb": [33,34],
"nsswitch.conf": [18],
"serial": [3],
"uidnumb": [16,10],
"data.ldif": [19],
"simplesecurityobject": [12],
"user": [[13,19,41],[10,18,24],[15,17,26,31,34]],
"negat": [3]
};
