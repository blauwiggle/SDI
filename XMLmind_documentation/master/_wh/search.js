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
 "dns_bind_installing_bind9.html",
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
 "ldap_accessing_ldap_data_by_a_mail_client.html",
 "ldap_testing_a_bind_operation_as_non_admin_user.html",
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
 "index.html"
];
wh.search_titleList = [
 "1. Installing bind9",
 "2. Change default and global options",
 "3. Zones configuration",
 "4. Error handling",
 "5.1. Forward lookup",
 "5.2. Reverse lookup",
 "5.3. Recursive DNS query",
 "5. Tests",
 "6. Mail exchange (MX) record configuration",
 "Chapter 1. DNS-bind",
 "1. Browse an existing LDAP Server",
 "2. Set up an OpenLdap server",
 "3. Populating the DIT",
 "5. Accessing LDAP data by a mail client",
 "4. Testing a bind operation as non - admin user",
 "6. LDAP configuration",
 "7. Filter based search",
 "8. Extending an existing entry",
 "9. LDAP based user login",
 "10. Backup and recovery / restore",
 "11. Accessing LDAP by a Python Application",
 "Chapter 2. LDAP",
 "1. First steps",
 "2. Virtual Hosts",
 "3. SSL / TLS support",
 "4. LDAP authentication",
 "5. MySQL database administration",
 "6. Providing WEB based user management to your LDAP Server",
 "7. Publish your documentation",
 "Chapter 3. Apache Web Server",
 "Documentation &#34;Software Defined Infrastructure&#34; in summer term 2020 (Group 8)"
];
wh.search_wordMap= {
"mysql-serv": [26],
"ns.plusline.d": [6],
"extens": [[22,23,24]],
"sha256": [24],
"upload": [24,[22,28]],
"addit": [[4,5,6,8],22],
"sslcertificatekeyfil": [24],
"your": [[27,28]],
"den": [20],
"via": [24],
"these": [[19,28]],
"path": [[2,19,22,23,28]],
"describ": [12],
"bind": [2,1,[3,14],8],
"would": [24],
"a2ensit": [[22,24]],
"record": [[2,8]],
"you": [2,25],
"ns.s.plusline.d": [6],
"ldapmodifi": [[15,17]],
"aa": [[4,5,8]],
"ad": [[8,23,25,28]],
"sure": [22],
"rsyslog.d": [15],
"version": [[4,5,6,8,12]],
"an": [[10,11,17,28]],
"betrayer.com": [16,12],
"extend": [10,[16,17]],
"as": [[12,26],[1,10,14,15]],
"at": [[2,10]],
"folder": [[19,24]],
"util": [0],
"configur": [[8,15,19],[1,22],[2,23],[13,18,24,27,28]],
"size": [[4,5,6,8]],
"stop": [19],
"allow-recurs": [1],
"domain": [23,[8,22]],
"sdi": [1],
"handl": [[3,18]],
"descript": [12],
"organ": [12],
"chapter": [[9,21,29]],
"be": [2],
"documentroot": [[22,23,24]],
"allowoverrid": [[22,23,24]],
"ergebni": [20],
"manual": [[23,25],22],
"digitalsignatur": [24],
"nonrepudi": [24],
"result": [16,10,[13,15,18]],
"uid": [16,10,12,[14,17,18]],
"see": [[1,10,14]],
"search": [16,10],
"reconnect": [10],
"skipt": [20],
"bw": [24],
"libpam-ldapd": [18],
"sslengin": [24],
"by": [18,[11,20,22],[8,10,13,15,16,24,28]],
"term": [30],
"after": [25,[8,12,26]],
"machin": [19,18,25],
"serverauth": [24],
"connect": [[10,14]],
"ca": [24],
"address": [1,[2,13]],
"set": [11,[1,2,15,19,25,28]],
"contain": [19],
"homedirectori": [17,10],
"access.log": [[22,23,24]],
"abl": [[10,15]],
"cn": [12,[10,15,16,24],[17,27]],
"aaaa": [6],
"the": [19,22,18,24,[1,23],[2,10,15],[8,14],[3,12,25],16,[0,11,13,26,27,28],17],
"aptitud": [11],
"organizationalperson": [16,12],
"answer": [[4,5,6,8]],
"infrastructur": [30],
"imag": [13],
"arch": [16],
"apach": [[10,12,22,26,29]],
"under": [27,[10,25,28]],
"config": [15,[24,27]],
"db": [2,26],
"did": [8],
"dc": [16,12,10,[17,27],[11,14,25]],
"thu": [[4,5,6]],
"de": [10,24],
"dig": [8,[4,5,6]],
"zugriff": [20],
"stud": [10],
"shadowaccount": [10],
"dn": [12,10,[15,16,17]],
"extern": [15],
"acl": [1],
"do": [[12,26]],
"got": [[4,5,6,8,15,16]],
"down": [18],
"dit": [[11,12]],
"named.conf.loc": [3,2],
"sites-avail": [[22,24]],
"export": [12],
"req": [24],
"add": [17,[2,15,23]],
"named-checkconf": [3],
"which": [22,[19,23]],
"ldap-account-manag": [27],
"brows": [10],
"test": [12,[7,14,18,22]],
"need": [[2,22,23,26,27]],
"chown": [19],
"ldif": [[10,19],[16,17]],
"rcvd": [[4,5,6,8]],
"check": [[3,8]],
"sslcertificatechainfil": [24],
"authnz_ldap": [25],
"respect": [[10,12]],
"ldapsearch": [16,10],
"success": [16,10,[18,22]],
"final": [24],
"http": [27],
"activ": [24],
"sdi8b.mi.hdm-stuttgart.de.conf": [22],
"webmast": [[22,23,24]],
"local4": [15],
"trust": [1,24],
"virtual": [23],
"for": [24,22,[15,16,23],[1,2,8,10,13,14,25,28]],
"cname": [2],
"ldap.log": [15],
"content": [[22,24]],
"prevent": [18],
"phpmyadmin": [26],
"accomplish": [22],
"load": [[2,24]],
"softwar": [16,12,[14,17,30]],
"stuttgart": [24],
"nscd": [18],
"scope": [10,16],
"root": [11],
"combin": [[22,23,24]],
"client": [13],
"just": [10],
"flci77iqx": [15],
"owner": [19],
"modifi": [17],
"cakey": [24],
"otherwis": [2],
"subjectaltnam": [24],
"dnssec-en": [1],
"ldap.conf": [10],
"retri": [2],
"home": [22,24,28,10,17],
"michael": [10,30],
"with": [16,[22,24],[10,15],[8,17],[12,14,19,25,26]],
"slapd.conf": [15],
"certif": [24],
"msec": [[4,5,6,8]],
"publish": [28],
"xmlmind": [22],
"well": [8],
"betray": [[12,16],[17,27],[11,14,25]],
"setup": [[18,26]],
"restor": [19],
"tls": [24],
"grant": [[22,24],[23,28]],
"directori": [22,24,23,[25,28],[1,10,12,19]],
"prompt": [24],
"listen-on": [1],
"backup": [19],
"sdi8b.mi.hdm-stuttgart.de-ssl": [24],
"told": [18],
"bin": [10],
"openldap": [19,11],
"ns.heise.d": [6],
"desir": [[15,22]],
"number": [[2,10]],
"e1ntsef9ovnyte5xnyttrdd1awxbmxp0ufbmws9gbenpnzdpuxg": [12],
"ca-csr.conf": [24],
"hdm-stuttgart": [10],
"specifi": [15],
"id": [[4,5,6,8,18]],
"https": [[24,28]],
"write": [15],
"order": [23,22],
"newli": [23],
"creat": [24,[15,23],[14,17,19,22,25]],
"python": [20],
"il": [16],
"in": [6,2,[8,22],[4,5],[1,23],[10,24],[12,13,15,18,27,30]],
"treesuffix": [27],
"made": [19],
"ip": [1],
"dns": [1,24,[0,6,8,10,23]],
"anonym": [10],
"organizationalrol": [12],
"index": [[22,23,24]],
"is": [22,[1,2,28]],
"it": [[14,15,17],[0,2,19,23,26]],
"manag": [[26,27]],
"system": [[15,18]],
"field": [10],
"loginshel": [10],
"invalid": [18],
"doc": [22,28,23,24],
"cmd": [[4,5,6,8]],
"status": [[4,5,6,8]],
"numrespons": [16,10],
"server": [[1,19],24,8,2,[10,11,25],[0,4,5,6,26],[12,13,18,23,27,29]],
"d1ce": [6],
"other": [14],
"valu": [[15,16]],
"enrol": [10],
"hdmstudent": [10],
"increas": [2],
"save": [2],
"paramet": [19,10],
"login": [[15,18,26]],
"local": [23],
"summer": [30],
"mention": [2],
"valid": [24,1],
"slapd.d": [19],
"vogt": [30],
"file": [[2,15,18,19,22,23],24,[10,17,27,28]],
"interfac": [27],
"top": [12,16],
"too": [10],
"locat": [22,[27,28]],
"keyusag": [24],
"have": [[2,27]],
"rootca.pem": [24],
"share": [[22,23]],
"sdi8b.csr": [24],
"givennam": [[12,16]],
"map": [2],
"avail": [28],
"extfil": [24],
"question": [[4,5,6,8]],
"may": [[4,5,6,8]],
"add_olcrootpw.ldif": [15],
"forward": [1,[2,4]],
"auth-nxdomain": [1],
"could": [[8,10,14,24]],
"cach": [2,[1,18]],
"manual.mi.hdm-stuttgart.d": [23],
"url": [28],
"dataencipher": [24],
"sdi8b.crt": [24],
"doc.conf": [25],
"genrsa": [24],
"exampl": [[10,13,22,23]],
"com": [16,12,[17,27],[11,14,25]],
"instal": [22,[0,11],[26,27],[10,18]],
"subnet": [2],
"soa": [2],
"mail": [8,[10,12,13,16]],
"replica": [19],
"use": [[10,19],[8,11,12,13,14,16,18,22,23,26,27]],
"db.mi.hdm-stuttgart.d": [2,8],
"ns.pop-hannover.d": [6],
"sign": [24],
"remot": [15],
"reconfigur": [10],
"objectclass": [12,10,16,17],
"correspond": [[23,25]],
"userpassword": [12],
"second": [[14,19]],
"mode": [1],
"that": [22,[2,8,10,18,24]],
"sd7uila1ztppli": [15],
"credent": [26],
"webserv": [26],
"olcdatabas": [15],
"config.ldif": [19],
"etc": [2,24,19,[1,3],[8,10,15,18,22,25]],
"usr": [[22,23]],
"find": [10],
"www": [22,[23,24]],
"host": [23],
"lam": [27],
"mi": [24],
"ldapv3": [10,16],
"sdi8b-crs.conf": [24],
"all": [[16,22,24],[10,23],[15,19,28]],
"administr": [[12,26]],
"new": [24,[2,15]],
"entri": [[8,16,17,23]],
"mi.hdm-stuttgart.d": [2,8,[4,10],5],
"author": [[4,5,6,8]],
"opcod": [[4,5,6,8]],
"difficult": [10],
"zhnnb2lqczk4ji8om2hun2yzuisjmymrwqcokcknej05acknoxpoyzg5n3o3": [12],
"mx": [8],
"fill": [15],
"revers": [[2,5]],
"tool": [10],
"x509": [24],
"servic": [[3,19],[1,8,15,24]],
"task": [[8,18]],
"www8": [2],
"were": [[10,15,18,24]],
"updat": [[1,22,27]],
"header": [[4,5,6,8]],
"nikla": [30],
"subtre": [10,16],
"modify_bean.ldif": [17],
"basic": [25],
"pop-hannover.net": [6],
"no": [[1,24]],
"expir": [2],
"p4": [[4,5,6,8]],
"websit": [22],
"apache_log_dir": [[22,23,24]],
"ns": [6,2,[4,5,8]],
"authldapurl": [25],
"keyencipher": [24],
"tsl": [24],
"vanhe": [30],
"nv012": [22,[23,24]],
"error.log": [[22,23,24]],
"dialog": [11],
"reload": [[1,3],[2,8]],
"execut": [[3,10,15,18,26]],
"ipv4": [[1,2]],
"hdm-stuttgart.d": [10,8],
"and": [19,26,[1,15,24],[17,18,23],[0,3,10,14,16,22,25,27,28]],
"ipv6": [1],
"of": [[14,19,23],[1,2,18,22,24]],
"dpkg-reconfigur": [[11,26]],
"dump": [12],
"ani": [1],
"gidnumb": [17,10],
"für": [20],
"make": [22],
"on": [19,25,[1,12,18,24]],
"skobowski": [10,30],
"ann": [[12,16]],
"purpos": [22],
"or": [16],
"pseudosect": [[4,5,6,8]],
"e68": [6],
"ou": [12,16,[14,17],[10,24]],
"accord": [17],
"rsyslog": [15],
"ttl": [2],
"master": [2],
"betrayerorg": [12],
"sdi8b.key": [24],
"vennam": [16],
"bind9": [0,[1,3]],
"ssl": [24],
"wasn\'t": [10],
"password": [[14,26]],
"necessari": [[18,25]],
"slapadd": [19],
"they": [24],
"qr": [[4,5,6,8]],
"apt": [22,[0,26,27]],
"edit": [22],
"want": [26],
"inetorgperson": [16,[10,12]],
"them": [[23,24]],
"then": [[10,19],[22,24],[3,15,16,17,18]],
"each": [23,2],
"ra": [[4,5,6,8]],
"databas": [[15,19],26],
"node": [24],
"rd": [[4,5,6,8]],
"includ": [23],
"passwd": [18],
"letter": [16],
"a2enmod": [25,24],
"customlog": [[22,23,24]],
"sub": [16,10],
"access": [[20,22],[13,15,23,24,25,26]],
"document": [22,28,[2,30]],
"ztnodfpevjlzvmhltdjkbfzrrjjurfjftms5ce1gukxjrghqttnvdlluwlfa": [12],
"global": [1,[4,5,6,8]],
"default": [1,22],
"found": [[4,5,6,8]],
"usernam": [[22,26]],
"sh": [10],
"are": [25],
"defin": [[16,30]],
"sn": [[10,12,16]],
"so": [[24,26]],
"email": [13],
"key": [24],
"redirect": [[22,23]],
"st": [24],
"stat": [15],
"changetyp": [17],
"one": [[14,19]],
"sslcertificatefil": [24],
"refresh": [2],
"cest": [[4,5,6,8]],
"call": [22],
"googl": [1],
"oper": [14],
"to": [23,15,[18,22],[2,19,24,25,26],[1,27,28],[0,3,10],[8,11,13,17]],
"v3": [24],
"but": [14],
"olcrootpw": [15],
"smith": [16,12],
"lib": [[19,27]],
"skript": [20],
"afterward": [11],
"organizationalunit": [12,16],
"had": [[0,10]],
"run": [[0,1,11,22,25,26]],
"either": [16],
"authtyp": [25],
"sdi8b.mi.hdm-stuttgart.d": [24,22,[25,26,27,28]],
"index.html": [22],
"mysql": [26],
"up": [[2,11,19,25,28]],
"keyword": [[22,23]],
"mv068": [[22,24]],
"www.manual.mi.hdm-stuttgart.d": [23],
"recurs": [1,6],
"actual": [19],
"last": [[8,24]],
"this": [24,[16,25],[1,2,12,18,28]],
"dure": [18],
"look": [12],
"alia": [22,24,[23,28]],
"daemon": [18],
"root.mi.hdm-stuttgart.d": [2],
"hallo": [22],
"distinguished_nam": [24],
"opt": [[4,5,6,8]],
"auf": [20],
"privat": [24,1],
"vm": [18],
"name": [2,10],
"subdomain": [23],
"guid": [26],
"page": [22],
"support": [24],
"sinc": [1],
"allow": [1],
"next": [[2,18,19,22,23,24,26]],
"userlist": [10],
"jectclass": [16],
"import": [1],
"show": [[13,18]],
"admin": [[15,27],12,[14,17]],
"kjyzuhbpq": [12],
"devel": [16,12,[14,17]],
"non": [14],
"servernam": [23,[22,24]],
"everi": [23],
"we": [24,22,10,[18,19],[15,26],[1,23],[2,8,27],[3,11,14,16,17,25],[0,12,13,28]],
"comput": [23],
"not": [[2,8,14]],
"appli": [[1,3,17]],
"sdi8a.mi.hdm-stuttgart.d": [4,2,[5,25]],
"florian": [10,30],
"queri": [6,[4,5,8],16,[1,18]],
"debian": [[4,5,6,8]],
"now": [[19,27],[10,14,15,24,25,26,28]],
"enabl": [[1,15,18,22,24,25]],
"yes": [1],
"was": [22,10,[8,16,18,23,25]],
"start": [16,19],
"ptr": [[2,5]],
"hdm": [[20,24],[1,10]],
"chang": [1,[2,23],[3,18]],
"popul": [12],
"financi": [12],
"step": [22],
"time": [[2,4,5,6,8]],
"noerror": [[4,5,6,8]],
"mark": [1],
"base": [[10,16],[18,27]],
"studio": [[10,12]],
"sdi8b-csr.conf": [24],
"shadow": [18],
"authnam": [25],
"heise.d": [6],
"errorlog": [[22,23,24]],
"type": [2,10],
"in-addr.arpa": [5,2],
"ns2": [6],
"when": [[4,5,6,8]],
"mon": [8],
"hostnam": [2],
"jim": [16,12],
"consist": [22],
"ns8": [2,[4,5,8]],
"posixaccount": [[10,17]],
"case": [22],
"numentri": [16,10],
"give": [19],
"applic": [20],
"goal": [25],
"var": [22,[15,23,24],[1,19,27]],
"work": [14],
"modul": [[24,25]],
"exist": [[10,17]],
"serveradmin": [[22,23,24]],
"listen-on-v6": [1],
"sdi8": [20],
"authent": [25],
"slide": [12],
"openssl": [24],
"flag": [[4,5,6,8]],
"apache2": [22,24,25,23],
"log": [15,27],
"lam.conf": [27],
"ldap1": [10],
"requir": [[22,24],[23,25,28]],
"our": [22,[10,24],[18,19],25,[13,15,23,26,27,28],[1,8,12]],
"freedoc": [12],
"out": [24],
"followsymlink": [[22,23,24]],
"web": [27,[24,25,29]],
"hdmaccount": [10],
"req_extens": [24],
"packag": [22,[10,18]],
"sult": [16],
"gruppen": [18],
"hdmcategori": [10],
"restart": [[15,18,19,24,25]],
"authbasicprovid": [25],
"deamon": [18],
"token": [10],
"ssha": [15],
"filter": [10,16],
"usag": [18],
"site": [24,28],
"serveralia": [23,[22,24]],
"first": [19,[10,15,22,24,25,27]],
"msg": [[4,5,6,8]],
"dcobject": [12],
"shut": [18],
"ldapi": [15],
"rootca.key": [24],
"data": [19,18,[12,13]],
"own": [[22,24]],
"ldap-util": [10],
"credenti": [[25,27]],
"section": [[4,5,6,8],1],
"separ": [23],
"listen": [1],
"fs120": [10,[22,24]],
"extendedkeyusag": [24],
"alt_nam": [24],
"zone": [2,8],
"ldap": [18,[20,25],10,19,[13,27],[12,15,17,21]],
"simpl": [25],
"eduperson": [10],
"from": [[19,24],1],
"html": [22],
"slapd": [[11,19]],
"depart": [16,12,[14,17]],
"replac": [22],
"day": [24],
"bean": [16,12,[14,17],18],
"group": [[18,30]],
"olclogfil": [15],
"localhost": [[22,23,24]],
"thunderbird": [13],
"profil": [14],
"ubuntu": [22],
"www.sdi8b.mi.hdm-stuttgart.d": [[22,24]],
"onli": [1],
"dns-bind": [9],
"edn": [[4,5,6,8]],
"class-c": [2],
"olcloglevel": [15],
"person": [16,12],
"exchang": [8],
"chain.txt": [24],
"achiev": [[18,25]],
"option": [1,[4,5,6,8,22,23,24]],
"here": [[2,25]],
"udp": [[4,5,6,8]],
"request": [[10,24],[1,16]],
"gid": [18],
"line": [[18,25,28]],
"generat": [24],
"error": [3],
"slapcat": [19],
"network": [1],
"can": [26,27],
"browser": [[22,24]],
"messag": [15],
"recoveri": [19],
"easi": [10],
"provid": [[18,22,24,25,27]],
"virtualhost": [[22,23,24]],
"lookup": [2,[4,5,13]],
"sdi8b": [[18,26,27]],
"conf-avail": [25],
"sdi8a": [[17,18]],
"process": [18],
"named.conf.opt": [1],
"will": [2],
"cacreateseri": [24],
"mx1": [8],
"attribut": [16,15,17],
"follow": [[10,12,16,18,25,26]],
"command": [[19,22],[3,10]],
"differ": [10],
"sdidoc": [22,24,28],
"nsswitch.conf": [18],
"serial": [2],
"uidnumb": [17,10],
"data.ldif": [19],
"simplesecurityobject": [12],
"user": [[14,19],[10,18,25],[15,16,27]],
"negat": [2]
};
