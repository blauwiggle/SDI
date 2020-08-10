function Snowball() {
BaseStemmer = function() {
this.setCurrent = function(value) {
this.current = value;
this.cursor = 0;
this.limit = this.current.length;
this.limit_backward = 0;
this.bra = this.cursor;
this.ket = this.limit;
};
this.getCurrent = function() {
return this.current;
};
this.copy_from = function(other) {
this.current = other.current;
this.cursor = other.cursor;
this.limit = other.limit;
this.limit_backward = other.limit_backward;
this.bra = other.bra;
this.ket = other.ket;
};
this.in_grouping = function(s, min, max) {
if (this.cursor >= this.limit) return false;
var ch = this.current.charCodeAt(this.cursor);
if (ch > max || ch < min) return false;
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) return false;
this.cursor++;
return true;
};
this.in_grouping_b = function(s, min, max) {
if (this.cursor <= this.limit_backward) return false;
var ch = this.current.charCodeAt(this.cursor - 1);
if (ch > max || ch < min) return false;
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) return false;
this.cursor--;
return true;
};
this.out_grouping = function(s, min, max) {
if (this.cursor >= this.limit) return false;
var ch = this.current.charCodeAt(this.cursor);
if (ch > max || ch < min) {
this.cursor++;
return true;
}
ch -= min;
if ((s[ch >>> 3] & (0X1 << (ch & 0x7))) == 0) {
this.cursor++;
return true;
}
return false;
};
this.out_grouping_b = function(s, min, max) {
if (this.cursor <= this.limit_backward) return false;
var ch = this.current.charCodeAt(this.cursor - 1);
if (ch > max || ch < min) {
this.cursor--;
return true;
}
ch -= min;
if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) {
this.cursor--;
return true;
}
return false;
};
this.eq_s = function(s)
{
if (this.limit - this.cursor < s.length) return false;
if (this.current.slice(this.cursor, this.cursor + s.length) != s)
{
return false;
}
this.cursor += s.length;
return true;
};
this.eq_s_b = function(s)
{
if (this.cursor - this.limit_backward < s.length) return false;
if (this.current.slice(this.cursor - s.length, this.cursor) != s)
{
return false;
}
this.cursor -= s.length;
return true;
};
 this.find_among = function(v)
{
var i = 0;
var j = v.length;
var c = this.cursor;
var l = this.limit;
var common_i = 0;
var common_j = 0;
var first_key_inspected = false;
while (true)
{
var k = i + ((j - i) >>> 1);
var diff = 0;
var common = common_i < common_j ? common_i : common_j; 
var w = v[k];
var i2;
for (i2 = common; i2 < w[0].length; i2++)
{
if (c + common == l)
{
diff = -1;
break;
}
diff = this.current.charCodeAt(c + common) - w[0].charCodeAt(i2);
if (diff != 0) break;
common++;
}
if (diff < 0)
{
j = k;
common_j = common;
}
else
{
i = k;
common_i = common;
}
if (j - i <= 1)
{
if (i > 0) break; 
if (j == i) break; 
if (first_key_inspected) break;
first_key_inspected = true;
}
}
do {
var w = v[i];
if (common_i >= w[0].length)
{
this.cursor = c + w[0].length;
if (w.length < 4) return w[2];
var res = w[3](this);
this.cursor = c + w[0].length;
if (res) return w[2];
}
i = w[1];
} while (i >= 0);
return 0;
};
this.find_among_b = function(v)
{
var i = 0;
var j = v.length
var c = this.cursor;
var lb = this.limit_backward;
var common_i = 0;
var common_j = 0;
var first_key_inspected = false;
while (true)
{
var k = i + ((j - i) >> 1);
var diff = 0;
var common = common_i < common_j ? common_i : common_j;
var w = v[k];
var i2;
for (i2 = w[0].length - 1 - common; i2 >= 0; i2--)
{
if (c - common == lb)
{
diff = -1;
break;
}
diff = this.current.charCodeAt(c - 1 - common) - w[0].charCodeAt(i2);
if (diff != 0) break;
common++;
}
if (diff < 0)
{
j = k;
common_j = common;
}
else
{
i = k;
common_i = common;
}
if (j - i <= 1)
{
if (i > 0) break;
if (j == i) break;
if (first_key_inspected) break;
first_key_inspected = true;
}
}
do {
var w = v[i];
if (common_i >= w[0].length)
{
this.cursor = c - w[0].length;
if (w.length < 4) return w[2];
var res = w[3](this);
this.cursor = c - w[0].length;
if (res) return w[2];
}
i = w[1];
} while (i >= 0);
return 0;
};
this.replace_s = function(c_bra, c_ket, s)
{
var adjustment = s.length - (c_ket - c_bra);
this.current = this.current.slice(0, c_bra) + s + this.current.slice(c_ket);
this.limit += adjustment;
if (this.cursor >= c_ket) this.cursor += adjustment;
else if (this.cursor > c_bra) this.cursor = c_bra;
return adjustment;
};
this.slice_check = function()
{
if (this.bra < 0 ||
this.bra > this.ket ||
this.ket > this.limit ||
this.limit > this.current.length)
{
return false;
}
return true;
};
this.slice_from = function(s)
{
var result = false;
if (this.slice_check())
{
this.replace_s(this.bra, this.ket, s);
result = true;
}
return result;
};
this.slice_del = function()
{
return this.slice_from("");
};
this.insert = function(c_bra, c_ket, s)
{
var adjustment = this.replace_s(c_bra, c_ket, s);
if (c_bra <= this.bra) this.bra += adjustment;
if (c_bra <= this.ket) this.ket += adjustment;
};
this.slice_to = function()
{
var result = '';
if (this.slice_check())
{
result = this.current.slice(this.bra, this.ket);
}
return result;
};
this.assign_to = function()
{
return this.current.slice(0, this.limit);
};
};
EnglishStemmer = function() {
var base = new BaseStemmer();
 var a_0 = [
["arsen", -1, -1],
["commun", -1, -1],
["gener", -1, -1]
];
 var a_1 = [
["'", -1, 1],
["'s'", 0, 1],
["'s", -1, 1]
];
 var a_2 = [
["ied", -1, 2],
["s", -1, 3],
["ies", 1, 2],
["sses", 1, 1],
["ss", 1, -1],
["us", 1, -1]
];
 var a_3 = [
["", -1, 3],
["bb", 0, 2],
["dd", 0, 2],
["ff", 0, 2],
["gg", 0, 2],
["bl", 0, 1],
["mm", 0, 2],
["nn", 0, 2],
["pp", 0, 2],
["rr", 0, 2],
["at", 0, 1],
["tt", 0, 2],
["iz", 0, 1]
];
 var a_4 = [
["ed", -1, 2],
["eed", 0, 1],
["ing", -1, 2],
["edly", -1, 2],
["eedly", 3, 1],
["ingly", -1, 2]
];
 var a_5 = [
["anci", -1, 3],
["enci", -1, 2],
["ogi", -1, 13],
["li", -1, 15],
["bli", 3, 12],
["abli", 4, 4],
["alli", 3, 8],
["fulli", 3, 9],
["lessli", 3, 14],
["ousli", 3, 10],
["entli", 3, 5],
["aliti", -1, 8],
["biliti", -1, 12],
["iviti", -1, 11],
["tional", -1, 1],
["ational", 14, 7],
["alism", -1, 8],
["ation", -1, 7],
["ization", 17, 6],
["izer", -1, 6],
["ator", -1, 7],
["iveness", -1, 11],
["fulness", -1, 9],
["ousness", -1, 10]
];
 var a_6 = [
["icate", -1, 4],
["ative", -1, 6],
["alize", -1, 3],
["iciti", -1, 4],
["ical", -1, 4],
["tional", -1, 1],
["ational", 5, 2],
["ful", -1, 5],
["ness", -1, 5]
];
 var a_7 = [
["ic", -1, 1],
["ance", -1, 1],
["ence", -1, 1],
["able", -1, 1],
["ible", -1, 1],
["ate", -1, 1],
["ive", -1, 1],
["ize", -1, 1],
["iti", -1, 1],
["al", -1, 1],
["ism", -1, 1],
["ion", -1, 2],
["er", -1, 1],
["ous", -1, 1],
["ant", -1, 1],
["ent", -1, 1],
["ment", 15, 1],
["ement", 16, 1]
];
 var a_8 = [
["e", -1, 1],
["l", -1, 2]
];
 var a_9 = [
["succeed", -1, -1],
["proceed", -1, -1],
["exceed", -1, -1],
["canning", -1, -1],
["inning", -1, -1],
["earring", -1, -1],
["herring", -1, -1],
["outing", -1, -1]
];
 var a_10 = [
["andes", -1, -1],
["atlas", -1, -1],
["bias", -1, -1],
["cosmos", -1, -1],
["dying", -1, 3],
["early", -1, 9],
["gently", -1, 7],
["howe", -1, -1],
["idly", -1, 6],
["lying", -1, 4],
["news", -1, -1],
["only", -1, 10],
["singly", -1, 11],
["skies", -1, 2],
["skis", -1, 1],
["sky", -1, -1],
["tying", -1, 5],
["ugly", -1, 8]
];
 var  g_v = [17, 65, 16, 1];
 var  g_v_WXY = [1, 17, 65, 208, 1];
 var  g_valid_LI = [55, 141, 2];
var  B_Y_found = false;
var  I_p2 = 0;
var  I_p1 = 0;
function r_prelude() {
B_Y_found = false;
var  v_1 = base.cursor;
lab0: {
base.bra = base.cursor;
if (!(base.eq_s("'")))
{
break lab0;
}
base.ket = base.cursor;
if (!base.slice_del())
{
return false;
}
}
base.cursor = v_1;
var  v_2 = base.cursor;
lab1: {
base.bra = base.cursor;
if (!(base.eq_s("y")))
{
break lab1;
}
base.ket = base.cursor;
if (!base.slice_from("Y"))
{
return false;
}
B_Y_found = true;
}
base.cursor = v_2;
var  v_3 = base.cursor;
lab2: {
while(true)
{
var  v_4 = base.cursor;
lab3: {
golab4: while(true)
{
var  v_5 = base.cursor;
lab5: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab5;
}
base.bra = base.cursor;
if (!(base.eq_s("y")))
{
break lab5;
}
base.ket = base.cursor;
base.cursor = v_5;
break golab4;
}
base.cursor = v_5;
if (base.cursor >= base.limit)
{
break lab3;
}
base.cursor++;
}
if (!base.slice_from("Y"))
{
return false;
}
B_Y_found = true;
continue;
}
base.cursor = v_4;
break;
}
}
base.cursor = v_3;
return true;
};
function r_mark_regions() {
I_p1 = base.limit;
I_p2 = base.limit;
var  v_1 = base.cursor;
lab0: {
lab1: {
var  v_2 = base.cursor;
lab2: {
if (base.find_among(a_0) == 0)
{
break lab2;
}
break lab1;
}
base.cursor = v_2;
golab3: while(true)
{
lab4: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab4;
}
break golab3;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
golab5: while(true)
{
lab6: {
if (!(base.out_grouping(g_v, 97, 121)))
{
break lab6;
}
break golab5;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
}
I_p1 = base.cursor;
golab7: while(true)
{
lab8: {
if (!(base.in_grouping(g_v, 97, 121)))
{
break lab8;
}
break golab7;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
golab9: while(true)
{
lab10: {
if (!(base.out_grouping(g_v, 97, 121)))
{
break lab10;
}
break golab9;
}
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
I_p2 = base.cursor;
}
base.cursor = v_1;
return true;
};
function r_shortv() {
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.out_grouping_b(g_v_WXY, 89, 121)))
{
break lab1;
}
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab1;
}
if (!(base.out_grouping_b(g_v, 97, 121)))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.out_grouping_b(g_v, 97, 121)))
{
return false;
}
if (!(base.in_grouping_b(g_v, 97, 121)))
{
return false;
}
if (base.cursor > base.limit_backward)
{
return false;
}
}
return true;
};
function r_R1() {
if (!(I_p1 <= base.cursor))
{
return false;
}
return true;
};
function r_R2() {
if (!(I_p2 <= base.cursor))
{
return false;
}
return true;
};
function r_Step_1a() {
var  among_var;
var  v_1 = base.limit - base.cursor;
lab0: {
base.ket = base.cursor;
if (base.find_among_b(a_1) == 0)
{
base.cursor = base.limit - v_1;
break lab0;
}
base.bra = base.cursor;
if (!base.slice_del())
{
return false;
}
}
base.ket = base.cursor;
among_var = base.find_among_b(a_2);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
if (!base.slice_from("ss"))
{
return false;
}
break;
case 2:
lab1: {
var  v_2 = base.limit - base.cursor;
lab2: {
{
var  c1 = base.cursor - 2;
if (base.limit_backward > c1 || c1 > base.limit)
{
break lab2;
}
base.cursor = c1;
}
if (!base.slice_from("i"))
{
return false;
}
break lab1;
}
base.cursor = base.limit - v_2;
if (!base.slice_from("ie"))
{
return false;
}
}
break;
case 3:
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
golab3: while(true)
{
lab4: {
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab4;
}
break golab3;
}
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_1b() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_4);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
if (!r_R1())
{
return false;
}
if (!base.slice_from("ee"))
{
return false;
}
break;
case 2:
var  v_1 = base.limit - base.cursor;
golab0: while(true)
{
lab1: {
if (!(base.in_grouping_b(g_v, 97, 121)))
{
break lab1;
}
break golab0;
}
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
}
base.cursor = base.limit - v_1;
if (!base.slice_del())
{
return false;
}
var  v_3 = base.limit - base.cursor;
among_var = base.find_among_b(a_3);
if (among_var == 0)
{
return false;
}
base.cursor = base.limit - v_3;
switch (among_var) {
case 1:
{
var  c1 = base.cursor;
base.insert(base.cursor, base.cursor, "e");
base.cursor = c1;
}
break;
case 2:
base.ket = base.cursor;
if (base.cursor <= base.limit_backward)
{
return false;
}
base.cursor--;
base.bra = base.cursor;
if (!base.slice_del())
{
return false;
}
break;
case 3:
if (base.cursor != I_p1)
{
return false;
}
var  v_4 = base.limit - base.cursor;
if (!r_shortv())
{
return false;
}
base.cursor = base.limit - v_4;
{
var  c2 = base.cursor;
base.insert(base.cursor, base.cursor, "e");
base.cursor = c2;
}
break;
}
break;
}
return true;
};
function r_Step_1c() {
base.ket = base.cursor;
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.eq_s_b("y")))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.eq_s_b("Y")))
{
return false;
}
}
base.bra = base.cursor;
if (!(base.out_grouping_b(g_v, 97, 121)))
{
return false;
}
lab2: {
if (base.cursor > base.limit_backward)
{
break lab2;
}
return false;
}
if (!base.slice_from("i"))
{
return false;
}
return true;
};
function r_Step_2() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_5);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R1())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("tion"))
{
return false;
}
break;
case 2:
if (!base.slice_from("ence"))
{
return false;
}
break;
case 3:
if (!base.slice_from("ance"))
{
return false;
}
break;
case 4:
if (!base.slice_from("able"))
{
return false;
}
break;
case 5:
if (!base.slice_from("ent"))
{
return false;
}
break;
case 6:
if (!base.slice_from("ize"))
{
return false;
}
break;
case 7:
if (!base.slice_from("ate"))
{
return false;
}
break;
case 8:
if (!base.slice_from("al"))
{
return false;
}
break;
case 9:
if (!base.slice_from("ful"))
{
return false;
}
break;
case 10:
if (!base.slice_from("ous"))
{
return false;
}
break;
case 11:
if (!base.slice_from("ive"))
{
return false;
}
break;
case 12:
if (!base.slice_from("ble"))
{
return false;
}
break;
case 13:
if (!(base.eq_s_b("l")))
{
return false;
}
if (!base.slice_from("og"))
{
return false;
}
break;
case 14:
if (!base.slice_from("less"))
{
return false;
}
break;
case 15:
if (!(base.in_grouping_b(g_valid_LI, 99, 116)))
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_3() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_6);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R1())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("tion"))
{
return false;
}
break;
case 2:
if (!base.slice_from("ate"))
{
return false;
}
break;
case 3:
if (!base.slice_from("al"))
{
return false;
}
break;
case 4:
if (!base.slice_from("ic"))
{
return false;
}
break;
case 5:
if (!base.slice_del())
{
return false;
}
break;
case 6:
if (!r_R2())
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_4() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_7);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
if (!r_R2())
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_del())
{
return false;
}
break;
case 2:
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!(base.eq_s_b("s")))
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!(base.eq_s_b("t")))
{
return false;
}
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_Step_5() {
var  among_var;
base.ket = base.cursor;
among_var = base.find_among_b(a_8);
if (among_var == 0)
{
return false;
}
base.bra = base.cursor;
switch (among_var) {
case 1:
lab0: {
var  v_1 = base.limit - base.cursor;
lab1: {
if (!r_R2())
{
break lab1;
}
break lab0;
}
base.cursor = base.limit - v_1;
if (!r_R1())
{
return false;
}
{
var  v_2 = base.limit - base.cursor;
lab2: {
if (!r_shortv())
{
break lab2;
}
return false;
}
base.cursor = base.limit - v_2;
}
}
if (!base.slice_del())
{
return false;
}
break;
case 2:
if (!r_R2())
{
return false;
}
if (!(base.eq_s_b("l")))
{
return false;
}
if (!base.slice_del())
{
return false;
}
break;
}
return true;
};
function r_exception2() {
base.ket = base.cursor;
if (base.find_among_b(a_9) == 0)
{
return false;
}
base.bra = base.cursor;
if (base.cursor > base.limit_backward)
{
return false;
}
return true;
};
function r_exception1() {
var  among_var;
base.bra = base.cursor;
among_var = base.find_among(a_10);
if (among_var == 0)
{
return false;
}
base.ket = base.cursor;
if (base.cursor < base.limit)
{
return false;
}
switch (among_var) {
case 1:
if (!base.slice_from("ski"))
{
return false;
}
break;
case 2:
if (!base.slice_from("sky"))
{
return false;
}
break;
case 3:
if (!base.slice_from("die"))
{
return false;
}
break;
case 4:
if (!base.slice_from("lie"))
{
return false;
}
break;
case 5:
if (!base.slice_from("tie"))
{
return false;
}
break;
case 6:
if (!base.slice_from("idl"))
{
return false;
}
break;
case 7:
if (!base.slice_from("gentl"))
{
return false;
}
break;
case 8:
if (!base.slice_from("ugli"))
{
return false;
}
break;
case 9:
if (!base.slice_from("earli"))
{
return false;
}
break;
case 10:
if (!base.slice_from("onli"))
{
return false;
}
break;
case 11:
if (!base.slice_from("singl"))
{
return false;
}
break;
}
return true;
};
function r_postlude() {
if (!B_Y_found)
{
return false;
}
while(true)
{
var  v_1 = base.cursor;
lab0: {
golab1: while(true)
{
var  v_2 = base.cursor;
lab2: {
base.bra = base.cursor;
if (!(base.eq_s("Y")))
{
break lab2;
}
base.ket = base.cursor;
base.cursor = v_2;
break golab1;
}
base.cursor = v_2;
if (base.cursor >= base.limit)
{
break lab0;
}
base.cursor++;
}
if (!base.slice_from("y"))
{
return false;
}
continue;
}
base.cursor = v_1;
break;
}
return true;
};
this.stem =  function() {
lab0: {
var  v_1 = base.cursor;
lab1: {
if (!r_exception1())
{
break lab1;
}
break lab0;
}
base.cursor = v_1;
lab2: {
{
var  v_2 = base.cursor;
lab3: {
{
var  c1 = base.cursor + 3;
if (0 > c1 || c1 > base.limit)
{
break lab3;
}
base.cursor = c1;
}
break lab2;
}
base.cursor = v_2;
}
break lab0;
}
base.cursor = v_1;
r_prelude();
r_mark_regions();
base.limit_backward = base.cursor; base.cursor = base.limit;
var  v_5 = base.limit - base.cursor;
r_Step_1a();
base.cursor = base.limit - v_5;
lab4: {
var  v_6 = base.limit - base.cursor;
lab5: {
if (!r_exception2())
{
break lab5;
}
break lab4;
}
base.cursor = base.limit - v_6;
var  v_7 = base.limit - base.cursor;
r_Step_1b();
base.cursor = base.limit - v_7;
var  v_8 = base.limit - base.cursor;
r_Step_1c();
base.cursor = base.limit - v_8;
var  v_9 = base.limit - base.cursor;
r_Step_2();
base.cursor = base.limit - v_9;
var  v_10 = base.limit - base.cursor;
r_Step_3();
base.cursor = base.limit - v_10;
var  v_11 = base.limit - base.cursor;
r_Step_4();
base.cursor = base.limit - v_11;
var  v_12 = base.limit - base.cursor;
r_Step_5();
base.cursor = base.limit - v_12;
}
base.cursor = base.limit_backward;
var  v_13 = base.cursor;
r_postlude();
base.cursor = v_13;
}
return true;
};
this['stemWord'] = function(word) {
base.setCurrent(word);
this.stem();
return base.getCurrent();
};
};
return new EnglishStemmer();
}
wh.search_stemmer = Snowball();
wh.search_baseNameList = [
 "software_distribution.html",
 "credentials.html",
 "overview.html",
 "querying_dns_data.html",
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
 "ldap_testing_a_bind_operation_as_non_admin_user.html",
 "ldap_accessing_ldap_data_by_a_mail_client.html",
 "ldap_ldap_configuration.html",
 "ldap_extending_an_existing_entry.html",
 "ldap_filter_based_search.html",
 "ldap_ldap_based_user_login.html",
 "ldap_backup_and_restore.html",
 "ldap_ldap_python.html",
 "ldap.html",
 "apache_first_steps.html",
 "apache_virtual_hosts.html",
 "apache_ldap_authentication.html",
 "apache_ssl_tls_support.html",
 "apache_mysql_database_administration.html",
 "apache_ldap_web_user_management.html",
 "apache_publish_documentation.html",
 "apache.html",
 "filecloud_prerequisites.html",
 "filecloud_apache_configuration.html",
 "filecloud_package_installation.html",
 "filecloud_associated_services.html",
 "filecloud_mariadb.html",
 "filecloud_installation.html",
 "filecloud_data_folders.html",
 "filecloud_memory_cache.html",
 "filecloud_finishing_installation.html",
 "filecloud_difficulties.html",
 "filecloud_ldap.html",
 "filecloud.html",
 "placeholder2.html",
 "ch06s02.html",
 "ch06s03.html",
 "samba.html",
 "index.html"
];
wh.search_titleList = [
 "1. Software distribution on the servers",
 "2. Credentials",
 "Chapter 1. Overview",
 "1. Querying DNS data",
 "2. Installing Bind",
 "3. Changing default and global options",
 "4. Zones configuration",
 "5. Error handling",
 "6.1. Forward lookup",
 "6.2. Reverse lookup",
 "6.3. Recursive DNS query",
 "6. Tests",
 "7. Mail exchange (MX) record configuration",
 "Chapter 2. DNS-bind",
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
 "11. Accessing LDAP by a Python Application",
 "Chapter 3. LDAP",
 "1. First steps",
 "2. Virtual Hosts",
 "4. LDAP authentication",
 "3. SSL / TLS support",
 "5. MySQL database administration",
 "6. Providing WEB based user management to our LDAP Server",
 "7. Publish your documentation",
 "Chapter 4. Apache Web Server",
 "1. Prerequisites",
 "3. Apache server configuration",
 "2. Nextcloud package installation",
 "4. Configuring associated services",
 "5. Configuring MariaDB",
 "6. Nextcloud installation and configuration",
 "7. Setting up the data folders",
 "8. Configuring the memory cache",
 "9. Finishing the installation",
 "11. Difficulties",
 "10. Adding LDAP support",
 "Chapter 5. File cloud",
 "1. Creating a Network Share",
 "2. Testing our share definitions using smbclient",
 "3. Mounting our share from a remote client",
 "Chapter 6. Network file systems served by Samba",
 "Documentation &#34;Software Defined Infrastructure&#34; in summer term 2020 (Group 8)"
];
wh.search_wordMap= {
"dns3": [3],
"upload": [29,[26,32]],
"dns1": [3],
"sslcertificatekeyfil": [[29,35]],
"your": [[32,46]],
"via": [[1,29]],
"these": [[23,32]],
"describ": [16],
"would": [29],
"a2ensit": [[26,29]],
"permiss": [40,35],
"vim": [34],
"ipc": [47],
"ldapmodifi": [[19,20]],
"serv": [49],
"version": [3,[8,9,10,12,16,36,43]],
"betrayer.com": [21,16],
"befor": [41],
"folder": [35,40,[1,23,29]],
"size": [3,[8,9,10,12,46]],
"util": [4],
"stop": [23],
"handl": [[7,22]],
"guest": [46],
"chapter": [[2,13,25,33,45,49]],
"browseabl": [46],
"allowoverrid": [[26,27,29,35]],
"role": [46],
"php-intl": [34],
"least": [43],
"manual": [[27,28],26],
"suffici": [35],
"result": [21,24,14,[18,19,22]],
"reconnect": [14],
"after": [[28,47],[12,16,30,46]],
"machin": [23,22,[28,46]],
"serverauth": [29],
"connect": [24,[1,14,17,44]],
"address": [5,[6,18]],
"abl": [[14,19,30,31,46]],
"supdat": [46],
"aaaa": [3,10],
"the": [23,[26,46],22,29,[35,43],[5,27],[6,14,19,40],44,[12,17,41],[7,16,28,47,48],[21,34,38,39,42],[1,4,15,18,30,31,32],[0,20,36]],
"snew": [46],
"imag": [18],
"arch": [21],
"goe": [46],
"thu": [[8,9,10]],
"correct": [[40,43]],
"stud": [14],
"opcache.en": [41],
"acl": [5],
"got": [3,[8,9,10,12,19,21]],
"database-us": [39],
"finish": [42],
"export": [16],
"pam": [46],
"req": [29],
"add": [20,[6,19,27]],
"ldap-account-manag": [31],
"need": [[6,26,27,46]],
"chown": [40,23,35],
"check": [[7,12,46,48]],
"authnz_ldap": [28],
"list": [47],
"respect": [[14,16]],
"php-curl": [34],
"success": [21,14,[22,26]],
"http": [31],
"sdi8b.mi.hdm-stuttgart.de.conf": [26],
"webmast": [[26,27,29,35]],
"local4": [19],
"trust": [5,[29,39]],
"cif": [48],
"php-simplexml": [34],
"prevent": [22],
"phpmyadmin": [30,[0,1]],
"accomplish": [[26,46]],
"softwar": [21,16,0,[17,20,24,50]],
"root": [46,1,47,48,[0,15,38,40]],
"scope": [14,21],
"combin": [[26,27,29,35]],
"end": [40],
"hard": [43],
"flci77iqx": [19],
"modifi": [20],
"cakey": [29],
"otherwis": [6],
"printabl": [46],
"subjectaltnam": [29],
"anyth": [46],
"env": [35],
"ldap.conf": [14],
"with": [21,[26,29],[14,19,44],[12,20,46,48],[16,17,23,28,30,36,38,39,42,43,47]],
"slapd.conf": [19],
"certif": [29,35],
"msec": [3,[8,9,10,12]],
"there": [43],
"well": [12],
"betray": [[16,21],[20,31],[15,17,24,28]],
"syntax": [46],
"tls": [29],
"directori": [26,[29,35,40,46],27,[28,32],[5,14,16,23,47]],
"listen-on": [5],
"backup": [23,46],
"told": [22],
"ns.heise.d": [10],
"desir": [[19,26,46]],
"number": [[6,14]],
"e1ntsef9ovnyte5xnyttrdd1awxbmxp0ufbmws9gbenpnzdpuxg": [16],
"ca-csr.conf": [29],
"identifi": [38],
"variabl": [41],
"specifi": [19],
"write": [19],
"order": [27,[26,46]],
"newli": [27],
"treesuffix": [31],
"php-xmlwriter": [34],
"organizationalrol": [16],
"connection.simple_bind_": [24],
"script": [40,39],
"exit": [38],
"system": [[19,22,34,38,49]],
"driver": [[46,47]],
"cmd": [3,[8,9,10,12]],
"d1ce": [10],
"other": [17],
"increas": [[6,46]],
"save": [6],
"complete-nc-installation-on-debian": [34],
"login": [42,[19,22,30,44]],
"restrict": [46],
"local": [[27,41]],
"valid": [46,29,5],
"slapd.d": [23],
"vogt": [50],
"interfac": [31],
"top": [16,21],
"too": [14],
"search_bas": [24],
"locat": [26,32],
"have": [6],
"share": [46,[47,48],[1,26,27]],
"sdi8b.csr": [29],
"givennam": [[16,21]],
"libapache2": [34],
"server_uri": [24],
"avail": [32],
"extfil": [29],
"question": [3,[8,9,10,12]],
"cach": [[6,41],[5,22]],
"notic": [43],
"doc.conf": [28],
"sdi8b.crt": [29,35],
"exampl": [[3,14,18,26,27]],
"php": [43,[39,41]],
"com": [21,16,[20,31],[15,17,24,28]],
"instal": [34,26,[4,15,30,39],[31,36,42,46,47],[14,22,35,43,44]],
"subnet": [6],
"replica": [[0,23]],
"php-mcrypt": [34],
"spool": [46],
"remot": [48,[19,47]],
"reconfigur": [14],
"objectclass": [16,14,21,20],
"correspond": [[27,28]],
"mode": [5],
"sd7uila1ztppli": [19],
"webserv": [30],
"etc": [6,29,[23,35,46],[5,7],[12,14,19,22,26,28,41]],
"lam": [31],
"ldapv3": [14,21],
"sdi8b-crs.conf": [29],
"all": [[21,26,29,35],[14,27,43],[19,23,32,34,38,46]],
"new": [[29,35],[6,19]],
"read": [46],
"mi.hdm-stuttgart.d": [6,12,[8,14],9,[24,44]],
"htgroup": [40],
"revers": [[3,6,9]],
"tool": [14],
"x509": [29],
"were": [[14,19,22,29,30,31,43]],
"therefor": [35],
"subtre": [14,21],
"basic": [28],
"pop-hannover.net": [10],
"unix": [46],
"expir": [6],
"websit": [26],
"apache_log_dir": [[26,27,29,35]],
"keyencipher": [29],
"php-json": [34],
"tsl": [29],
"vanhe": [50],
"nv012": [26,[27,29,35]],
"error.log": [[26,27,29,35]],
"reload": [[5,7],[6,12]],
"ldap.scope_onelevel": [24],
"and": [23,[1,5,19,29,30,40,43,44],[20,22,27,37],[0,4,7,14,17,21,26,28,31,32,35,36,38,39,42,46,47]],
"chmod": [40],
"panic-act": [46],
"dump": [[16,46]],
"attr": [24],
"ani": [5],
"skobowski": [14,50],
"ann": [[16,21]],
"e68": [10],
"accord": [20],
"rsyslog": [19],
"ttl": [6],
"obey": [46],
"respond": [48],
"wasn\'t": [14],
"password": [46,[1,48],[17,30,47]],
"slapadd": [23],
"let": [46],
"state": [44],
"php.ini": [41],
"rlimit_max": [46],
"press": [46],
"app": [[40,43,44]],
"apt": [34,26,[4,30,31]],
"inetorgperson": [21,[14,16]],
"smb.conf": [46],
"mount": [48,47],
"each": [27,6],
"databas": [38,[19,23],[0,30,37,39]],
"letter": [21],
"php-mbstring": [34],
"document": [26,32,[6,50]],
"ztnodfpevjlzvmhltdjkbfzrrjjurfjftms5ce1gukxjrghqttnvdlluwlfa": [16],
"mainten": [39],
"two": [43],
"opcache.interned_strings_buff": [41],
"default": [5,26],
"found": [[8,9,10,12]],
"usernam": [[1,26,30,44]],
"are": [28],
"sudo": [[34,39,48]],
"latest": [36],
"tagesschau.d": [3],
"sslcertificatefil": [[29,35]],
"refresh": [6],
"cest": [3,[8,9,10,12]],
"call": [26],
"mariadb-serv": [[30,34]],
"googl": [5],
"ownership": [35],
"thing": [34],
"definit": [[46,47]],
"olcrootpw": [19],
"smith": [21,16],
"lib": [[23,31,46]],
"nano": [46],
"had": [[4,14,35,43,46,48]],
"run": [[4,5,15,26,28,46]],
"either": [21],
"authtyp": [28],
"index.html": [26],
"keyword": [[26,27]],
"those": [43],
"recurs": [5,10],
"difficulti": [43],
"actual": [23],
"last": [[12,29]],
"dure": [[22,44]],
"sync": [46],
"alia": [[26,35],29,[27,32]],
"opcache.max_accelerated_fil": [41],
"root.mi.hdm-stuttgart.d": [6],
"hallo": [[26,48]],
"warn": [[46,47]],
"aug": [3],
"nc_data": [40],
"privat": [29,5],
"name": [6,14],
"page": [[26,40,43]],
"next": [[6,22,23,26,27,29,30,46]],
"import": [24,5],
"htuser": [40],
"becaus": [46],
"show": [[18,22,44,46]],
"kjyzuhbpq": [16],
"effort": [43],
"devel": [21,16,[17,20,24]],
"non": [17],
"servernam": [27,[26,29,35]],
"comput": [27],
"not": [[6,12,17,35,43]],
"privileg": [38],
"sdi8a.mi.hdm-stuttgart.d": [8,6,[0,1,9,28]],
"florian": [14,50],
"now": [23,[14,17,19,28,29,32,42,43]],
"samba": [46,47,48,[0,1,49]],
"enabl": [37,[5,19,22,26,28,29,35]],
"overview": [[1,2]],
"associ": [37],
"yes": [46,5],
"was": [[26,43],[14,34,46],[12,21,22,27,28,35,42]],
"start": [21,[23,37]],
"ouser": [48],
"ssuccess": [46],
"php-imagick": [34],
"ptr": [[3,6,9]],
"hdm": [[24,29,44],[5,14,43]],
"chang": [5,[6,27,46],[7,22]],
"financi": [16],
"noerror": [3,[8,9,10,12]],
"time": [3,[6,8,9,10,12]],
"iz-net": [3],
"window": [47,46],
"studio": [[14,16]],
"sdi9a": [47],
"shadow": [22],
"authnam": [28],
"heise.d": [10],
"program": [46],
"ns2": [10],
"ns1": [3],
"when": [3,[8,9,10,12]],
"galleri": [44],
"jim": [21,16],
"ns5": [3],
"ns8": [6,[8,9,12]],
"sdi8bnextclouddbpassword": [[1,38,39]],
"posixaccount": [[14,20]],
"enter": [46,47],
"case": [46,26],
"give": [[1,23,35]],
"applic": [1,24],
"modul": [[28,29]],
"memori": [41],
"sdi8": [24],
"authent": [28],
"slide": [16],
"tabl": [1,0],
"apache2": [26,29,35,[28,37],[27,34,41,42]],
"log": [46,[19,44],31],
"spassword": [46],
"php-xmlreader": [34],
"unzip": [[34,36]],
"freedoc": [16],
"web": [31,[0,28,29,33]],
"hdmaccount": [14],
"req_extens": [29],
"theme": [40],
"sult": [21],
"hdmcategori": [14],
"workgroup": [47],
"tutori": [[40,43]],
"deamon": [22],
"ssha": [19],
"ldap.initi": [24],
"wrong": [46],
"sharenam": [47],
"usag": [22],
"serveralia": [27,[26,29,35]],
"chat": [46],
"advanc": [43],
"apt-get": [46,47],
"shut": [22],
"credenti": [1,[28,30,31,44]],
"ldap-util": [14],
"ncdata": [40],
"section": [3,[8,9,10,12,46],[5,41]],
"smbpasswd": [46],
"listen": [5],
"cloud": [[34,45]],
"extendedkeyusag": [29],
"major": [43],
"ldap": [24,22,28,14,[23,44],[0,1,18,31,43],[16,19,20,25]],
"zone": [6,12],
"idmap": [46],
"day": [29],
"bean": [21,16,[17,20],[22,24]],
"group": [[22,44,50]],
"olclogfil": [19],
"profil": [17],
"www.sdi8b.mi.hdm-stuttgart.d": [[26,29,35]],
"kind": [43],
"nc_perm.sh": [40],
"class-c": [6],
"effect": [46],
"exchang": [12],
"achiev": [[22,28]],
"option": [5,3,[8,9,10,12,26,27,29,35,46,47]],
"udp": [3,[8,9,10,12]],
"request": [[14,29],[5,21]],
"generat": [29,35],
"insert": [48],
"slapcat": [23],
"point": [37],
"stretch-and-manual-upd": [34],
"browser": [[26,29]],
"messag": [[19,47]],
"prerequisit": [34],
"easi": [14],
"virtualhost": [[26,27,29,35]],
"nextcloud": [35,39,[36,38],[40,42],[1,43],[0,34]],
"sdi8b": [1,[22,30,31,47]],
"sdi8a": [1,[20,22]],
"process": [46,[22,44]],
"move": [[36,40]],
"attribut": [21,19,20],
"admin-us": [39],
"also": [35],
"differ": [14],
"mariadb": [37,[30,38],1],
"nsswitch.conf": [22],
"various": [1],
"simplesecurityobject": [16],
"user": [46,[17,23,44],[14,22,28],[19,21,31,35,38]],
"proxi": [46],
"ns.plusline.d": [10],
"extens": [[26,27,29]],
"sha256": [29],
"bad": [46],
"mime": [35],
"addit": [3,[8,9,10,12],26],
"path": [46,[6,23,26,27,32]],
"bind": [6,5,[7,17],[4,12]],
"record": [[6,12]],
"mkdir": [40],
"you": [6,28],
"ns.s.plusline.d": [10],
"aa": [[8,9,12]],
"ad": [44,[12,27,28,32,38,39,41,46]],
"sure": [[26,35]],
"smbd": [46],
"rsyslog.d": [19],
"automat": [37],
"an": [43,[1,14,15,20,32]],
"panic": [46],
"extend": [14,[20,21]],
"as": [[16,30],[5,14,17,19,38,44]],
"at": [37,[6,14,34,43]],
"configur": [[12,19,23],[5,26],[6,27,35,39,41,43],[18,22,29,31,32,37,38,44]],
"allow-recurs": [5],
"domain": [[27,47],[12,26,39]],
"sdi": [5],
"descript": [16],
"organ": [16],
"be": [6,[43,46]],
"documentroot": [[26,27,29,35]],
"latest.zip": [36],
"www-data": [35,40,39],
"digitalsignatur": [29],
"nonrepudi": [29],
"uid": [21,14,16,24,[17,20,22]],
"see": [47,[5,14,17,46]],
"search": [21,14],
"releas": [36],
"bw": [29],
"libpam-ldapd": [22],
"sslengin": [[29,35]],
"by": [22,[15,26,38],[12,14,18,19,21,24,29,32,35,39,46,47,49]],
"php-gd": [34],
"term": [50],
"ca": [29],
"cd": [35],
"set": [40,[15,46],[5,6,19,23,28,32,37,42]],
"contain": [23],
"homedirectori": [20,14],
"access.log": [[26,27,29,35]],
"cn": [16,[14,19,21,29],[20,31]],
"right": [43],
"cp": [46],
"figur": [43],
"aptitud": [15],
"renam": [40],
"organizationalperson": [21,16],
"answer": [3,[8,9,10,12]],
"infrastructur": [50],
"apach": [35,[0,14,16,26,30,33,37,38,42]],
"under": [31,[14,28,32,39,41,42,44]],
"config": [46,19,[29,31,39,40]],
"db": [6],
"did": [12],
"dc": [21,16,14,[20,24,31],[15,17,28]],
"test.txt": [48,47],
"de": [14,29,24],
"dig": [3,12,[8,9,10]],
"belwue.d": [3],
"shadowaccount": [14],
"opcache.revalidate_freq": [41],
"dn": [16,14,[19,20,21]],
"extern": [19],
"do": [[16,30,34,43,44]],
"dir": [35],
"down": [22],
"dit": [[15,16]],
"named.conf.loc": [7,6],
"startup": [37],
"sites-avail": [[26,29]],
"named-checkconf": [7],
"which": [26,46,[23,27,42,43,48]],
"brows": [14],
"download.nextcloud.com": [36],
"test": [48,16,[11,17,22,26,47]],
"ldif": [[14,23],[20,21]],
"rcvd": [3,[8,9,10,12]],
"sslcertificatechainfil": [[29,35]],
"take": [46],
"ldapsearch": [21,14],
"adjust": [[35,39,41]],
"final": [[29,44]],
"activ": [[29,44]],
"some": [35],
"virtual": [27],
"fi": [40],
"origin": [46],
"for": [29,[26,35],[19,21,27,43],[1,3,5,6,12,14,17,18,28,32,38,46]],
"cname": [6],
"ldap.log": [19],
"testparm": [46],
"content": [[26,29,48]],
"database-pass": [39],
"miss": [40],
"load": [46,[6,29]],
"stuttgart": [29],
"nscd": [22],
"client": [18,[47,48]],
"just": [14,38],
"over": [1],
"owner": [23],
"dnssec-en": [5],
"retri": [6],
"home": [26,[29,35],[32,46],14,[20,47]],
"michael": [14,50],
"print": [46,47],
"publish": [32],
"xmlmind": [26],
"setup": [[22,30,35]],
"restor": [23,46],
"grant": [[26,29,35],[27,32,38]],
"prompt": [29,[46,48]],
"expert": [43],
"sdi8b.mi.hdm-stuttgart.de-ssl": [29],
"bin": [14,[40,46]],
"openldap": [23,15],
"occ": [[39,40]],
"retyp": [[43,46]],
"output": [[46,47]],
"hdm-stuttgart": [14,24],
"action": [46],
"id": [3,[8,9,10,12,22]],
"https": [[29,32,34,36,42]],
"dunkel.d": [3],
"if": [40,47],
"creat": [[29,46],[19,27],40,[1,17,20,23,26,28,38,44,47]],
"python": [24],
"il": [21],
"in": [3,10,6,[12,26],46,[8,9,44],[5,27],[14,29,43],[16,18,19,22,31,48,50]],
"mod-php": [34],
"made": [[23,35]],
"ip": [5],
"printer": [46,47],
"dns": [5,29,[0,3,4,10,12,14,27,46]],
"anonym": [14],
"index": [[26,27,29,35]],
"is": [26,46,[5,6,32,43,47]],
"php-mysql": [34],
"it": [40,[17,19,20,43,44,46],[4,6,23,27,30,36]],
"manag": [[30,31]],
"decid": [46],
"field": [14],
"loginshel": [14],
"invalid": [22],
"doc": [26,32,27,[29,35]],
"connection.unbind": [24],
"php-zip": [34],
"status": [3,[8,9,10,12]],
"numrespons": [21,14],
"server": [[5,23],29,[0,12,35],6,[1,14,15,28,46,47],[3,4,8,9,10,30,37],[16,18,22,27,31,33,36,38,39,42,44]],
"valu": [[19,21]],
"pprint": [24],
"enrol": [14],
"hdmstudent": [14],
"standalon": [46],
"paramet": [23,[14,46]],
"smb": [46],
"summer": [50],
"mention": [6],
"file": [46,[6,19,22,23,26,27],[29,47],[1,14,20,32,34,35,39,40,41,45,49]],
"keyusag": [29],
"rootca.pem": [29],
"database-nam": [39],
"map": [[6,35,46]],
"may": [[8,9,10,12]],
"add_olcrootpw.ldif": [19],
"max": [46],
"forward": [5,[6,8,42]],
"auth-nxdomain": [5],
"could": [[44,48],[12,14,17,29,40,42,47]],
"trusted_domain": [39],
"manual.mi.hdm-stuttgart.d": [27],
"url": [32],
"dataencipher": [29],
"genrsa": [29],
"soa": [6],
"mail": [12,[14,16,18,21]],
"use": [[14,23,47],[1,12,15,16,17,18,21,22,26,27,30,31,34,35,38,46]],
"db.mi.hdm-stuttgart.d": [6,12],
"ls": [48],
"ns.pop-hannover.d": [10],
"sign": [29],
"while": [43],
"admin-pass": [39],
"userpassword": [16],
"second": [[17,23]],
"that": [[26,43],[6,12,14,22,29,35,40,47]],
"index.php": [42],
"olcdatabas": [19],
"config.ldif": [23],
"usr": [46,[26,27]],
"find": [40,14],
"www": [40,35,26,[27,29],[36,39]],
"host": [27,[6,35]],
"limit": [46],
"outdat": [43],
"mi": [29,43],
"administr": [[16,30]],
"entri": [[12,20,21,27]],
"author": [3,[8,9,10,12]],
"opcod": [3,[8,9,10,12]],
"difficult": [[14,43]],
"zhnnb2lqczk4ji8om2hun2yzuisjmymrwqcokcknej05acknoxpoyzg5n3o3": [16],
"mv": [[36,40]],
"mx": [12],
"fill": [19],
"servic": [46,[7,23],[5,12,19,29,37,42,47]],
"config.php": [39],
"disk": [47],
"task": [43,[12,22,34,35,38]],
"www8": [6],
"rewrit": [35],
"header": [3,[8,9,10,12,35]],
"updat": [40,[5,26,31,46]],
"nikla": [50],
"modify_bean.ldif": [20],
"no": [46,[5,29],1],
"code": [46],
"p4": [3,[8,9,10,12]],
"ns": [3,10,6,[8,9,12]],
"authldapurl": [28],
"sql": [38],
"dialog": [15],
"execut": [40,[7,14,19,22,30,38,39]],
"hdm-stuttgart.d": [3,14,12],
"ipv4": [[5,6]],
"ipv6": [5],
"of": [46,[35,43],[17,23,27],[5,6,22,26,29,48]],
"dpkg-reconfigur": [[15,30]],
"possibl": [[40,44]],
"backend": [[44,46]],
"ok": [46],
"gidnumb": [20,14],
"make": [[26,43,44,46]],
"on": [23,28,[0,5,16,22,29,35,38,43,46]],
"opcache.enable_c": [41],
"sdi8bnextcloudadminpassword": [[1,39]],
"purpos": [26],
"or": [21],
"pseudosect": [3,[8,9,10,12]],
"os": [47],
"ou": [16,21,24,[17,20],[14,29]],
"master": [6,47],
"betrayerorg": [16],
"sdi8b.key": [29,35],
"vennam": [21],
"satement": [38],
"ncpath": [40],
"ssh": [1],
"bind9": [[4,5,7]],
"ssl": [29,35],
"cover": [35],
"necessari": [[22,28,34,35]],
"search_filt": [24],
"they": [29],
"qr": [3,[8,9,10,12]],
"edit": [[26,46]],
"them": [[27,29,37]],
"then": [40,[14,23,46],[26,29],[7,19,20,21,22,36,39,43,44,47,48]],
"ra": [3,[8,9,10,12]],
"php-xml": [34],
"node": [29],
"rd": [3,[8,9,10,12]],
"includ": [27],
"passwd": [46,22],
"a2enmod": [35,28,29],
"customlog": [[26,27,29,35]],
"sub": [21,14],
"access": [26,[1,18,19,24,27,28,29,30,47]],
"deprec": [[46,47]],
"global": [[3,5,46],[8,9,10,12]],
"syslog": [46,47],
"current": [43],
"sh": [14],
"defin": [[21,50]],
"sn": [[14,16,21]],
"so": [[29,30,38,40]],
"key": [29,1],
"email": [18],
"redirect": [[26,27]],
"st": [29],
"stat": [19],
"changetyp": [20],
"one": [[17,23]],
"reinstal": [43],
"oper": [17],
"to": [46,27,19,[22,26],[6,23,28,29,43],[5,30,32,34,35,40,44],[4,7,14,31,42],[12,15,18,20,36,37,38,39,41,47,48]],
"v3": [29],
"but": [[17,43]],
"user_nam": [46],
"afterward": [15],
"organizationalunit": [16,21],
"sdi8b.mi.hdm-stuttgart.d": [29,35,26,42,[0,1,24,28,30,31,32,39,48]],
"sever": [43],
"mysql": [[0,30,38,39]],
"up": [46,[6,15,23,28,32,37,40,42]],
"written": [43],
"us": [46],
"mv068": [[26,29,35]],
"www.manual.mi.hdm-stuttgart.d": [27],
"this": [29,[21,28,44],[5,6,16,22,32,34,37,43,46,48]],
"opcache.memory_consumpt": [41],
"look": [16],
"daemon": [22],
"distinguished_nam": [29],
"opt": [3,[8,9,10,12]],
"vi": [40],
"print0": [40],
"vm": [22],
"subdomain": [27],
"guid": [[30,34]],
"support": [44,29],
"sinc": [5],
"allow": [[1,5,46]],
"userlist": [14,24],
"jectclass": [21],
"systemctl": [37,42],
"admin": [[19,31],[16,44],[17,20]],
"everi": [27],
"we": [29,[26,46],14,[22,23],[19,30,35,40,44],[5,27,47],[6,12,31,48],[7,15,17,20,21,28,38,39,41,42,43],[1,4,16,18,32,34,36,37]],
"printf": [40],
"flush": [38],
"appli": [[5,7,20]],
"queri": [3,10,[8,9,12],21,[5,22]],
"debian": [47,3,[8,9,10,12]],
"help.nextcloud.com": [34],
"mask": [46],
"middl": [43],
"previous": [[35,38]],
"xarg": [40],
"again": [43],
"distribut": [0],
"role_standalon": [46],
"mnt": [48],
"popul": [16],
"step": [[26,46]],
"bash": [40],
"comment": [46,47],
"mark": [5],
"base": [[14,21],[22,31]],
"iz-www": [3],
"sdi8b-csr.conf": [29],
"mod": [35],
"errorlog": [[26,27,29,35]],
"in-addr.arpa": [3,9,6],
"type": [40,6,[14,47]],
"mon": [3,12],
"consist": [26],
"sdi8bsamba": [[1,46]],
"connection.search_": [24],
"numentri": [21,14],
"goal": [28],
"var": [40,35,[26,46],[19,27,29,36],[5,23,31,39]],
"work": [[17,43]],
"exist": [[14,20,38]],
"serveradmin": [[26,27,29,35]],
"itself": [46],
"listen-on-v6": [5],
"openssl": [29],
"flag": [3,[8,9,10,12]],
"lam.conf": [31],
"wget": [36],
"ldap1": [14,[24,44]],
"copi": [40],
"requir": [35,[26,29],[27,28,32,43,46]],
"our": [26,[14,29,46],[22,23,35],[28,31],[18,19,27,30,32,37,38,44,47,48],[1,5,12,16,39,42]],
"out": [29,43],
"followsymlink": [[26,27,29,35]],
"packag": [26,[14,22,34,36,43]],
"gruppen": [22],
"restart": [37,[42,46],[19,22,23,28,29]],
"authbasicprovid": [28],
"token": [14],
"filter": [14,21],
"site": [29,[32,35]],
"sambashar": [46,47,[1,48]],
"minimum": [46],
"first": [23,[14,19,26,28,29,34,39,46,47]],
"msg": [3,[8,9,10,12]],
"dcobject": [16],
"ldapi": [19],
"rootca.key": [29],
"data": [23,40,22,[3,16,18]],
"htaccess": [40],
"own": [[26,29]],
"separ": [27],
"fs120": [14,[26,29,35]],
"alt_nam": [29],
"tab": [43],
"simpl": [[28,47]],
"eduperson": [14],
"from": [[23,24,29],[1,5,35,38,40,46,47,48]],
"html": [26],
"slapd": [[15,23]],
"depart": [21,16,[17,20,24]],
"replac": [26],
"localhost": [[1,26,27,29,35,38,39,47]],
"thunderbird": [18],
"ubuntu": [26],
"onli": [5,46,[1,44]],
"dns-bind": [13],
"edn": [3,[8,9,10,12]],
"mistud": [24],
"olcloglevel": [19],
"person": [21,16,1],
"usershar": [46],
"chain.txt": [[29,35]],
"here": [[6,28]],
"smbclient": [47],
"gid": [22],
"line": [[22,28,32]],
"opcache.save_com": [41],
"error": [7],
"network": [[5,46,49]],
"array": [39],
"cat": [48],
"rootus": [40],
"ncadmin": [[1,39]],
"recoveri": [23],
"provid": [[22,26,28,29,31]],
"lookup": [6,[3,8,9,18]],
"conf-avail": [28],
"named.conf.opt": [5],
"will": [6],
"cacreateseri": [29],
"mx1": [12],
"follow": [46,[1,14,16,21,22,28,30,34,38,41,44,48]],
"instead": [35],
"command": [46,[23,26,48],[7,14,43]],
"sdidoc": [26,[29,35],32],
"tdb": [46],
"serial": [6],
"uidnumb": [20,14],
"data.ldif": [23],
"negat": [6]
};
