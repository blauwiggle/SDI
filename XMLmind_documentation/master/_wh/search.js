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
 "overview.html",
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
 "ldap_populating_the_dit.html",
 "ldap_set_up_an_openldap_server.html",
 "ldap_accessing_ldap_data_by_a_mail_client.html",
 "ldap_testing_a_bind_operation_as_non_admin_user.html",
 "ldap_extending_an_existing_entry.html",
 "ldap_filter_based_search.html",
 "ldap_ldap_configuration.html",
 "ldap_ldap_based_user_login.html",
 "ldap_backup_and_restore.html",
 "ldap_ldap_python.html",
 "apache_first_steps.html",
 "ldap.html",
 "apache_ssl_tls_support.html",
 "apache_virtual_hosts.html",
 "apache_ldap_authentication.html",
 "apache_mysql_database_administration.html",
 "apache_ldap_web_user_management.html",
 "apache_publish_documentation.html",
 "apache.html",
 "filecloud_package_installation.html",
 "filecloud_prerequisites.html",
 "filecloud_apache_configuration.html",
 "filecloud_associated_services.html",
 "filecloud_mariadb.html",
 "filecloud_installation.html",
 "filecloud_data_folders.html",
 "filecloud_memory_cache.html",
 "filecloud_finishing_installation.html",
 "filecloud_ldap.html",
 "filecloud.html",
 "filecloud_difficulties.html",
 "placeholder2.html",
 "index.html",
 "samba.html"
];
wh.search_titleList = [
 "1. Software distribution on the servers",
 "2. Credentials",
 "Chapter 1. Overview",
 "1. Installing bind9",
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
 "3. Populating the DIT",
 "2. Set up an OpenLdap server",
 "5. Accessing LDAP data by a mail client",
 "4. Testing a bind operation as non - admin user",
 "8. Extending an existing entry",
 "7. Filter based search",
 "6. LDAP configuration",
 "9. LDAP based user login",
 "10. Backup and recovery / restore",
 "11. Accessing LDAP by a Python Application",
 "1. First steps",
 "Chapter 3. LDAP",
 "3. SSL / TLS support",
 "2. Virtual Hosts",
 "4. LDAP authentication",
 "5. MySQL database administration",
 "6. Providing WEB based user management to your LDAP Server",
 "7. Publish your documentation",
 "Chapter 4. Apache Web Server",
 "2. Nextcloud package installation",
 "1. Prerequisites",
 "3. Apache server configuration",
 "4. Configuring associated services",
 "5. Configuring MariaDB",
 "6. Nextcloud installation and configuration",
 "7. Setting up the data folders",
 "8. Configuring the memory cache",
 "9. Finishing the installation",
 "10. Adding LDAP support",
 "Chapter 5. File cloud",
 "11. Difficulties",
 "1. ",
 "Documentation &#34;Software Defined Infrastructure&#34; in summer term 2020 (Group 8)",
 "Chapter 6. Network file systems served by Samba"
];
wh.search_wordMap= {
"ns.plusline.d": [9],
"extens": [[24,26,27]],
"sha256": [26],
"upload": [26,[24,31]],
"mime": [35],
"addit": [[7,8,9,11],24],
"sslcertificatekeyfil": [[26,35]],
"your": [[30,31]],
"via": [[1,26]],
"these": [[22,31]],
"path": [[5,22,24,27,31]],
"describ": [14],
"bind": [5,4,[6,17],11],
"would": [26],
"a2ensit": [[24,26]],
"permiss": [39,35],
"record": [[5,11]],
"vim": [34],
"mkdir": [39],
"you": [5,28],
"ns.s.plusline.d": [9],
"ldapmodifi": [[18,20]],
"aa": [[7,8,11]],
"ad": [42,[11,27,28,31,37,38,40]],
"sure": [[24,35]],
"serv": [47],
"rsyslog.d": [20],
"automat": [36],
"an": [44,[1,13,15,18,31]],
"version": [[7,8,9,11,14,33,44]],
"betrayer.com": [19,14],
"extend": [13,[18,19]],
"as": [[14,29],[4,13,17,20,37,42]],
"befor": [40],
"folder": [35,39,[1,22,26]],
"at": [36,[5,13,34,44]],
"util": [3],
"configur": [[11,20,22],[4,24],[5,27,35,38,40,44],[16,21,26,30,31,36,37,42]],
"size": [[7,8,9,11]],
"stop": [22],
"allow-recurs": [4],
"domain": [27,[11,24,38]],
"sdi": [4],
"handl": [[6,21]],
"descript": [14],
"organ": [14],
"chapter": [[2,12,25,32,43,47]],
"be": [5,44],
"documentroot": [[24,26,27,35]],
"allowoverrid": [[24,26,27,35]],
"latest.zip": [33],
"php-intl": [34],
"least": [44],
"www-data": [35,39,38],
"manual": [[27,28],24],
"digitalsignatur": [26],
"suffici": [35],
"nonrepudi": [26],
"result": [19,23,13,[16,20,21]],
"uid": [19,13,14,23,[17,18,21]],
"see": [[4,13,17]],
"search": [19,13],
"reconnect": [13],
"releas": [33],
"bw": [26],
"libpam-ldapd": [21],
"sslengin": [[26,35]],
"by": [21,[15,24,37],[11,13,16,19,20,23,26,31,35,38,47]],
"php-gd": [34],
"term": [46],
"after": [28,[11,14,29]],
"machin": [22,21,28],
"serverauth": [26],
"connect": [23,[1,13,17,42]],
"ca": [26],
"cd": [35],
"address": [4,[5,16]],
"set": [39,15,[4,5,20,22,28,31,36,41]],
"contain": [22],
"homedirectori": [18,13],
"access.log": [[24,26,27,35]],
"abl": [[13,20,29,30]],
"cn": [14,[13,19,20,26],[18,30]],
"right": [44],
"aaaa": [9],
"figur": [44],
"the": [22,24,21,26,[35,44],[4,27],[5,13,20,39],42,[11,17,40],[6,14,28],[19,34,37,38,41],[1,3,15,16,29,30,31],[0,18,33]],
"aptitud": [15],
"renam": [39],
"organizationalperson": [19,14],
"answer": [[7,8,9,11]],
"infrastructur": [46],
"imag": [16],
"arch": [19],
"apach": [35,[0,13,14,24,29,32,36,37,41]],
"under": [30,[13,28,31,38,40,41,42]],
"config": [20,[26,30,38,39]],
"db": [5],
"did": [11],
"dc": [19,14,13,[18,23,30],[15,17,28]],
"thu": [[7,8,9]],
"de": [13,26,23],
"dig": [11,[7,8,9]],
"correct": [[39,44]],
"stud": [13],
"shadowaccount": [13],
"opcache.en": [40],
"opcache.revalidate_freq": [40],
"dn": [14,13,[18,19,20]],
"extern": [20],
"acl": [4],
"do": [[14,29,34,42,44]],
"dir": [35],
"got": [[7,8,9,11,19,20]],
"down": [21],
"dit": [[14,15]],
"named.conf.loc": [6,5],
"startup": [36],
"sites-avail": [[24,26]],
"database-us": [38],
"finish": [41],
"export": [14],
"req": [26],
"add": [18,[5,20,27]],
"named-checkconf": [6],
"which": [24,[22,27,41,44]],
"ldap-account-manag": [30],
"brows": [13],
"download.nextcloud.com": [33],
"test": [14,[10,17,21,24]],
"need": [[5,24,27]],
"chown": [39,22,35],
"ldif": [[13,22],[18,19]],
"rcvd": [[7,8,9,11]],
"check": [[6,11]],
"sslcertificatechainfil": [[26,35]],
"authnz_ldap": [28],
"respect": [[13,14]],
"ldapsearch": [19,13],
"php-curl": [34],
"success": [19,13,[21,24]],
"adjust": [[35,38,40]],
"final": [[26,42]],
"http": [30],
"activ": [[26,42]],
"sdi8b.mi.hdm-stuttgart.de.conf": [24],
"webmast": [[24,26,27,35]],
"local4": [20],
"trust": [4,[26,38]],
"some": [35],
"virtual": [27],
"fi": [39],
"php-simplexml": [34],
"for": [26,[24,35],[19,20,27,44],[1,4,5,11,13,16,17,28,31,37]],
"cname": [5],
"ldap.log": [20],
"content": [[24,26]],
"database-pass": [38],
"miss": [39],
"prevent": [21],
"phpmyadmin": [29,[0,1]],
"accomplish": [24],
"softwar": [19,14,0,[17,18,23,46]],
"load": [[5,26]],
"stuttgart": [26],
"nscd": [21],
"root": [1,[0,15,37,39]],
"scope": [13,19],
"combin": [[24,26,27,35]],
"client": [16],
"end": [39],
"hard": [44],
"just": [13,37],
"flci77iqx": [20],
"over": [1],
"owner": [22],
"modifi": [18],
"cakey": [26],
"otherwis": [5],
"subjectaltnam": [26],
"env": [35],
"dnssec-en": [4],
"ldap.conf": [13],
"retri": [5],
"home": [24,[26,35],31,13,18],
"michael": [13,46],
"with": [19,[24,26],[13,20,42],[11,18],[14,17,22,28,29,33,37,38,41,44]],
"slapd.conf": [20],
"certif": [26,35],
"msec": [[7,8,9,11]],
"publish": [31],
"there": [44],
"xmlmind": [24],
"well": [11],
"betray": [[14,19],[18,30],[15,17,23,28]],
"setup": [[21,29,35]],
"restor": [22],
"tls": [26],
"grant": [[24,26,35],[27,31,37]],
"directori": [24,[26,35,39],27,[28,31],[4,13,14,22]],
"prompt": [26],
"listen-on": [4],
"backup": [22],
"expert": [44],
"sdi8b.mi.hdm-stuttgart.de-ssl": [26],
"told": [21],
"bin": [13,39],
"openldap": [22,15],
"ns.heise.d": [9],
"desir": [[20,24]],
"occ": [[38,39]],
"retyp": [44],
"number": [[5,13]],
"e1ntsef9ovnyte5xnyttrdd1awxbmxp0ufbmws9gbenpnzdpuxg": [14],
"ca-csr.conf": [26],
"identifi": [37],
"variabl": [40],
"hdm-stuttgart": [13,23],
"specifi": [20],
"id": [[7,8,9,11,21]],
"https": [[26,31,33,34,41]],
"write": [20],
"if": [39],
"order": [27,24],
"newli": [27],
"creat": [26,[20,27],39,[1,17,18,22,24,28,37,42]],
"python": [23],
"il": [19],
"in": [9,5,[11,24],[7,8,42],[4,27],[13,26,44],[14,16,20,21,30,46]],
"treesuffix": [30],
"mod-php": [34],
"made": [[22,35]],
"ip": [4],
"php-xmlwriter": [34],
"dns": [4,26,[0,3,9,11,13,27]],
"anonym": [13],
"organizationalrol": [14],
"index": [[24,26,27,35]],
"is": [24,[4,5,31,44]],
"connection.simple_bind_": [23],
"php-mysql": [34],
"it": [39,[17,18,20,42,44],[3,5,22,27,29,33]],
"manag": [[29,30]],
"script": [39,38],
"exit": [37],
"system": [[20,21,34,37,47]],
"field": [13],
"loginshel": [13],
"invalid": [21],
"doc": [24,31,27,[26,35]],
"cmd": [[7,8,9,11]],
"connection.unbind": [23],
"php-zip": [34],
"status": [[7,8,9,11]],
"numrespons": [19,13],
"server": [[4,22],26,[0,11,35],5,[1,13,15,28],[3,7,8,9,29,36],[14,16,21,27,30,32,33,37,38,41,42]],
"d1ce": [9],
"other": [17],
"valu": [[19,20]],
"pprint": [23],
"enrol": [13],
"hdmstudent": [13],
"increas": [5],
"save": [5],
"paramet": [22,13],
"complete-nc-installation-on-debian": [34],
"login": [41,[20,21,29,42]],
"local": [[27,40]],
"summer": [46],
"mention": [5],
"valid": [26,4],
"slapd.d": [22],
"vogt": [46],
"file": [[5,20,21,22,24,27],26,[1,13,18,31,34,35,38,39,40,43,47]],
"interfac": [30],
"top": [14,19],
"too": [13],
"search_bas": [23],
"locat": [24,31],
"keyusag": [26],
"have": [5],
"rootca.pem": [26],
"share": [[1,24,27]],
"sdi8b.csr": [26],
"givennam": [[14,19]],
"database-nam": [38],
"map": [[5,35]],
"libapache2": [34],
"server_uri": [23],
"avail": [31],
"extfil": [26],
"question": [[7,8,9,11]],
"may": [[7,8,9,11]],
"add_olcrootpw.ldif": [20],
"forward": [4,[5,7,41]],
"auth-nxdomain": [4],
"could": [42,[11,13,17,26,39,41]],
"trusted_domain": [38],
"cach": [[5,40],[4,21]],
"manual.mi.hdm-stuttgart.d": [27],
"url": [31],
"dataencipher": [26],
"notic": [44],
"sdi8b.crt": [26,35],
"doc.conf": [28],
"genrsa": [26],
"exampl": [[13,16,24,27]],
"php": [44,[38,40]],
"com": [19,14,[18,30],[15,17,23,28]],
"instal": [34,24,[3,15,29,38],[30,33,41],[13,21,35,42,44]],
"subnet": [5],
"replica": [[0,22]],
"soa": [5],
"mail": [11,[13,14,16,19]],
"php-mcrypt": [34],
"use": [[13,22],[1,11,14,15,16,17,19,21,24,27,29,30,34,35,37]],
"db.mi.hdm-stuttgart.d": [5,11],
"ns.pop-hannover.d": [9],
"sign": [26],
"remot": [20],
"while": [44],
"reconfigur": [13],
"objectclass": [14,13,19,18],
"correspond": [[27,28]],
"admin-pass": [38],
"userpassword": [14],
"second": [[17,22]],
"mode": [4],
"that": [[24,44],[5,11,13,21,26,35,39]],
"sd7uila1ztppli": [20],
"index.php": [41],
"webserv": [29],
"olcdatabas": [20],
"config.ldif": [22],
"etc": [5,26,[22,35],[4,6],[11,13,20,21,24,28,40]],
"usr": [[24,27]],
"find": [39,13],
"www": [39,35,24,[26,27],[33,38]],
"host": [27,[5,35]],
"lam": [30],
"outdat": [44],
"mi": [26,44],
"ldapv3": [13,19],
"sdi8b-crs.conf": [26],
"all": [[19,24,26,35],[13,27,44],[20,22,31,34,37]],
"administr": [[14,29]],
"new": [[26,35],[5,20]],
"entri": [[11,18,19,27]],
"mi.hdm-stuttgart.d": [5,11,[7,13],8,[23,42]],
"author": [[7,8,9,11]],
"opcod": [[7,8,9,11]],
"htgroup": [39],
"difficult": [[13,44]],
"zhnnb2lqczk4ji8om2hun2yzuisjmymrwqcokcknej05acknoxpoyzg5n3o3": [14],
"mv": [[33,39]],
"mx": [11],
"fill": [20],
"revers": [[5,8]],
"tool": [13],
"x509": [26],
"servic": [[6,22],[4,11,20,26,36,41]],
"config.php": [38],
"task": [44,[11,21,34,35,37]],
"www8": [5],
"were": [[13,20,21,26,29,30,44]],
"rewrit": [35],
"updat": [39,[4,24,30]],
"header": [[7,8,9,11,35]],
"therefor": [35],
"nikla": [46],
"subtre": [13,19],
"modify_bean.ldif": [18],
"basic": [28],
"pop-hannover.net": [9],
"no": [[4,26],1],
"expir": [5],
"p4": [[7,8,9,11]],
"websit": [24],
"apache_log_dir": [[24,26,27,35]],
"ns": [9,5,[7,8,11]],
"authldapurl": [28],
"keyencipher": [26],
"php-json": [34],
"tsl": [26],
"vanhe": [46],
"nv012": [24,[26,27,35]],
"error.log": [[24,26,27,35]],
"sql": [37],
"dialog": [15],
"reload": [[4,6],[5,11]],
"execut": [39,[6,13,20,21,29,37,38]],
"ipv4": [[4,5]],
"hdm-stuttgart.d": [13,11],
"ldap.scope_onelevel": [23],
"and": [22,[1,4,20,26,29,39,42,44],[18,21,27,36],[0,3,6,13,17,19,24,28,30,31,33,35,37,38,41]],
"ipv6": [4],
"of": [[35,44],[17,22,27],[4,5,21,24,26]],
"dpkg-reconfigur": [[15,29]],
"chmod": [39],
"possibl": [[39,42]],
"backend": [42],
"dump": [14],
"attr": [23],
"ani": [4],
"gidnumb": [18,13],
"make": [[24,42,44]],
"on": [22,28,[0,4,14,21,26,35,37,44]],
"opcache.enable_c": [40],
"sdi8bnextcloudadminpassword": [[1,38]],
"skobowski": [13,46],
"ann": [[14,19]],
"purpos": [24],
"or": [19],
"pseudosect": [[7,8,9,11]],
"e68": [9],
"ou": [14,19,23,[17,18],[13,26]],
"accord": [18],
"rsyslog": [20],
"ttl": [5],
"master": [5],
"betrayerorg": [14],
"sdi8b.key": [26,35],
"vennam": [19],
"satement": [37],
"ncpath": [39],
"ssh": [1],
"bind9": [3,[4,6]],
"ssl": [26,35],
"wasn\'t": [13],
"cover": [35],
"password": [1,[17,29]],
"necessari": [[21,28,34,35]],
"search_filt": [23],
"slapadd": [22],
"state": [42],
"php.ini": [40],
"they": [26],
"app": [[39,42,44]],
"qr": [[7,8,9,11]],
"apt": [34,24,[3,29,30]],
"edit": [24],
"inetorgperson": [19,[13,14]],
"them": [[26,27,36]],
"then": [39,[13,22],[24,26],[6,18,19,20,21,33,38,42,44]],
"each": [27,5],
"databas": [37,[20,22],[0,29,36,38]],
"ra": [[7,8,9,11]],
"php-xml": [34],
"node": [26],
"rd": [[7,8,9,11]],
"includ": [27],
"passwd": [21],
"letter": [19],
"a2enmod": [35,28,26],
"php-mbstring": [34],
"customlog": [[24,26,27,35]],
"sub": [19,13],
"access": [24,[1,16,20,23,26,27,28,29]],
"document": [24,31,[5,46]],
"ztnodfpevjlzvmhltdjkbfzrrjjurfjftms5ce1gukxjrghqttnvdlluwlfa": [14],
"global": [4,[7,8,9,11]],
"mainten": [38],
"two": [44],
"opcache.interned_strings_buff": [40],
"default": [4,24],
"current": [44],
"found": [[7,8,9,11]],
"usernam": [[1,24,29,42]],
"sh": [13],
"are": [28],
"defin": [[19,46]],
"sn": [[13,14,19]],
"sudo": [[34,38]],
"so": [[26,29,37,39]],
"key": [26,1],
"email": [16],
"latest": [33],
"redirect": [[24,27]],
"st": [26],
"stat": [20],
"changetyp": [18],
"one": [[17,22]],
"sslcertificatefil": [[26,35]],
"reinstal": [44],
"refresh": [5],
"cest": [[7,8,9,11]],
"call": [24],
"mariadb-serv": [[29,34]],
"googl": [4],
"ownership": [35],
"oper": [17],
"to": [27,20,[21,24],[5,22,26,28,44],[4,29,31,34,35,39,42],[3,6,13,30,41],[11,15,16,18,33,36,37,38,40]],
"v3": [26],
"thing": [34],
"but": [[17,44]],
"olcrootpw": [20],
"smith": [19,14],
"lib": [[22,30]],
"afterward": [15],
"organizationalunit": [14,19],
"had": [[3,13,35,44]],
"run": [[3,4,15,24,28]],
"either": [19],
"authtyp": [28],
"sdi8b.mi.hdm-stuttgart.d": [26,35,24,41,[0,1,23,28,29,30,31,38]],
"sever": [44],
"index.html": [24],
"mysql": [[0,29,37,38]],
"up": [[5,15,22,28,31,36,39,41]],
"written": [44],
"keyword": [[24,27]],
"those": [44],
"mv068": [[24,26,35]],
"www.manual.mi.hdm-stuttgart.d": [27],
"recurs": [4,9],
"difficulti": [44],
"actual": [22],
"last": [[11,26]],
"this": [26,[19,28,42],[4,5,14,21,31,34,36,44]],
"opcache.memory_consumpt": [40],
"dure": [[21,42]],
"look": [14],
"alia": [[24,35],26,[27,31]],
"opcache.max_accelerated_fil": [40],
"daemon": [21],
"root.mi.hdm-stuttgart.d": [5],
"hallo": [24],
"distinguished_nam": [26],
"opt": [[7,8,9,11]],
"nc_data": [39],
"vi": [39],
"privat": [26,4],
"print0": [39],
"vm": [21],
"name": [5,13],
"subdomain": [27],
"guid": [[29,34]],
"page": [[24,39,44]],
"support": [42,26],
"sinc": [4],
"allow": [[1,4]],
"next": [[5,21,22,24,26,27,29]],
"userlist": [13,23],
"jectclass": [19],
"systemctl": [36,41],
"import": [23,4],
"htuser": [39],
"show": [[16,21,42]],
"admin": [[20,30],[14,42],[17,18]],
"kjyzuhbpq": [14],
"effort": [44],
"devel": [19,14,[17,18,23]],
"non": [17],
"servernam": [27,[24,26,35]],
"everi": [27],
"we": [26,24,13,[21,22],[20,29,35,39,42],[4,27],[5,11,30],[6,15,17,18,19,28,37,38,40,41,44],[1,3,14,16,31,33,34,36]],
"printf": [39],
"comput": [27],
"not": [[5,11,17,35,44]],
"privileg": [37],
"flush": [37],
"sdi8a.mi.hdm-stuttgart.d": [7,5,[0,1,8,28]],
"appli": [[4,6,18]],
"florian": [13,46],
"queri": [9,[7,8,11],19,[4,21]],
"debian": [[7,8,9,11]],
"now": [22,[13,17,20,26,28,31,41,44]],
"help.nextcloud.com": [34],
"samba": [[1,47]],
"enabl": [36,[4,20,21,24,26,28,35]],
"overview": [[1,2]],
"middl": [44],
"previous": [[35,37]],
"associ": [36],
"yes": [4],
"xarg": [39],
"again": [44],
"was": [[24,44],[13,34],[11,19,21,27,28,35,41]],
"start": [19,[22,36]],
"distribut": [0],
"php-imagick": [34],
"ptr": [[5,8]],
"hdm": [[23,26,42],[4,13,44]],
"chang": [4,[5,27],[6,21]],
"popul": [14],
"financi": [14],
"step": [24],
"bash": [39],
"time": [[5,7,8,9,11]],
"noerror": [[7,8,9,11]],
"mark": [4],
"base": [[13,19],[21,30]],
"studio": [[13,14]],
"sdi8b-csr.conf": [26],
"mod": [35],
"shadow": [21],
"authnam": [28],
"heise.d": [9],
"errorlog": [[24,26,27,35]],
"type": [39,5,13],
"in-addr.arpa": [8,5],
"ns2": [9],
"when": [[7,8,9,11]],
"mon": [11],
"galleri": [42],
"jim": [19,14],
"consist": [24],
"sdi8bsamba": [1],
"ns8": [5,[7,8,11]],
"sdi8bnextclouddbpassword": [[1,37,38]],
"posixaccount": [[13,18]],
"case": [24],
"connection.search_": [23],
"give": [[1,22,35]],
"applic": [1,23],
"numentri": [19,13],
"goal": [28],
"var": [39,35,24,[20,26,27,33],[4,22,30,38]],
"work": [[17,44]],
"modul": [[26,28]],
"exist": [[13,18,37]],
"serveradmin": [[24,26,27,35]],
"memori": [40],
"listen-on-v6": [4],
"sdi8": [23],
"authent": [28],
"slide": [14],
"openssl": [26],
"tabl": [1,0],
"flag": [[7,8,9,11]],
"apache2": [24,26,35,[28,36],[27,34,40,41]],
"log": [[20,42],30],
"lam.conf": [30],
"wget": [33],
"ldap1": [13,[23,42]],
"php-xmlreader": [34],
"copi": [39],
"requir": [35,[24,26],[27,28,31,44]],
"unzip": [[33,34]],
"our": [24,[13,26],[21,22,35],28,[16,20,27,29,30,31,36,37,42],[1,4,11,14,38,41]],
"freedoc": [14],
"out": [26,44],
"followsymlink": [[24,26,27,35]],
"web": [30,[0,26,28,32]],
"hdmaccount": [13],
"req_extens": [26],
"theme": [39],
"packag": [24,[13,21,33,34,44]],
"sult": [19],
"gruppen": [21],
"hdmcategori": [13],
"restart": [36,41,[20,21,22,26,28]],
"tutori": [[39,44]],
"authbasicprovid": [28],
"deamon": [21],
"token": [13],
"ssha": [20],
"ldap.initi": [23],
"filter": [13,19],
"usag": [21],
"site": [26,[31,35]],
"serveralia": [27,[24,26,35]],
"sambashar": [1],
"advanc": [44],
"first": [22,[13,20,24,26,28,34,38]],
"msg": [[7,8,9,11]],
"dcobject": [14],
"shut": [21],
"ldapi": [20],
"rootca.key": [26],
"data": [22,39,21,[14,16]],
"htaccess": [39],
"own": [[24,26]],
"credenti": [1,[28,29,30,42]],
"ldap-util": [13],
"ncdata": [39],
"section": [[7,8,9,11],[4,40]],
"separ": [27],
"listen": [4],
"fs120": [13,[24,26,35]],
"cloud": [[34,43]],
"extendedkeyusag": [26],
"alt_nam": [26],
"major": [44],
"tab": [44],
"ldap": [23,21,28,13,[22,42],[0,1,16,30,44],[14,18,20,25]],
"zone": [5,11],
"simpl": [28],
"eduperson": [13],
"from": [[22,23,26],[1,4,35,37,39]],
"html": [24],
"slapd": [[15,22]],
"depart": [19,14,[17,18,23]],
"replac": [24],
"day": [26],
"bean": [19,14,[17,18],[21,23]],
"group": [[21,42,46]],
"localhost": [[1,24,26,27,35,37,38]],
"olclogfil": [20],
"thunderbird": [16],
"profil": [17],
"ubuntu": [24],
"www.sdi8b.mi.hdm-stuttgart.d": [[24,26,35]],
"kind": [44],
"onli": [4,[1,42]],
"nc_perm.sh": [39],
"dns-bind": [12],
"edn": [[7,8,9,11]],
"class-c": [5],
"mistud": [23],
"olcloglevel": [20],
"person": [19,14,1],
"exchang": [11],
"chain.txt": [[26,35]],
"achiev": [[21,28]],
"option": [4,[7,8,9,11,24,26,27,35]],
"here": [[5,28]],
"udp": [[7,8,9,11]],
"request": [[13,26],[4,19]],
"gid": [21],
"line": [[21,28,31]],
"opcache.save_com": [40],
"generat": [26,35],
"error": [6],
"slapcat": [22],
"point": [36],
"network": [[4,47]],
"stretch-and-manual-upd": [34],
"array": [38],
"browser": [[24,26]],
"rootus": [39],
"ncadmin": [[1,38]],
"messag": [20],
"recoveri": [22],
"prerequisit": [34],
"easi": [13],
"provid": [[21,24,26,28,30]],
"virtualhost": [[24,26,27,35]],
"nextcloud": [35,38,[33,37],[39,41],[1,44],[0,34]],
"sdi8b": [1,[21,29,30]],
"lookup": [5,[7,8,16]],
"conf-avail": [28],
"sdi8a": [1,[18,21]],
"process": [[21,42]],
"move": [[33,39]],
"named.conf.opt": [4],
"will": [5],
"cacreateseri": [26],
"mx1": [11],
"attribut": [19,20,18],
"admin-us": [38],
"also": [35],
"follow": [[1,13,14,19,21,28,29,34,37,40,42]],
"instead": [35],
"command": [[22,24],[6,13,44]],
"differ": [13],
"sdidoc": [24,[26,35],31],
"mariadb": [36,[29,37],1],
"nsswitch.conf": [21],
"serial": [5],
"various": [1],
"uidnumb": [18,13],
"data.ldif": [22],
"simplesecurityobject": [14],
"user": [[17,22,42],[13,21,28],[19,20,30,35,37]],
"negat": [5]
};
