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
 "overview_software_distribution.html",
 "overview_credentials.html",
 "overview.html",
 "dns_querying_dns_data.html",
 "dns_bind_change_default_and_global_options.html",
 "dns_bind_installing_bind9.html",
 "dns_bind_error_handling.html",
 "dns_bind_zones_configuration.html",
 "dns_bind_tests_forward_lookup.html",
 "dns_bind_tests_reverse_lookup.html",
 "dns_bind_tests.html",
 "dns_bind_test_recursive_dns_query.html",
 "dns_bind.html",
 "dns_bind_mail_exchange_mx_record_configuration.html",
 "ldap_browse_an_existing_ldap_server.html",
 "ldap_set_up_an_openldap_server.html",
 "ldap_populating_the_dit.html",
 "ldap_accessing_ldap_data_by_a_mail_client.html",
 "ldap_testing_a_bind_operation_as_non_admin_user.html",
 "ldap_filter_based_search.html",
 "ldap_ldap_configuration.html",
 "ldap_extending_an_existing_entry.html",
 "ldap_ldap_based_user_login.html",
 "ldap_backup_and_restore.html",
 "ldap_replication_configuration_master.html",
 "ldap_replication.html",
 "ldap_replication_configuration_client.html",
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
 "filecloud_finishing_installation.html",
 "filecloud_memory_cache.html",
 "filecloud_difficulties.html",
 "filecloud_ldap.html",
 "filecloud.html",
 "samba_creating_a_network_share.html",
 "samba_mounting_share.html",
 "samba_testing_share_definitions.html",
 "samba.html",
 "index.html"
];
wh.search_titleList = [
 "1. Software distribution on the servers",
 "2. Credentials",
 "Chapter 1. Overview",
 "1. Querying DNS data",
 "3. Changing default and global options",
 "2. Installing Bind",
 "5. Error handling",
 "4. Zones configuration",
 "6.1. Forward lookup",
 "6.2. Reverse lookup",
 "6. Tests",
 "6.3. Recursive DNS query",
 "Chapter 2. DNS-bind",
 "7. Mail exchange (MX) record configuration",
 "1. Browse an existing LDAP Server",
 "2. Set up an OpenLdap server",
 "3. Populating the DIT",
 "5. Accessing LDAP data by a mail client",
 "4. Testing a bind operation as non - admin user",
 "7. Filter based search",
 "6. LDAP configuration",
 "8. Extending an existing entry",
 "9. LDAP based user login",
 "10. Backup and recovery / restore",
 "11.1. Configuring the Master",
 "11. Replication",
 "11.2. Configuring the Client",
 "12. Accessing LDAP by a Python Application",
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
 "9. Finishing the installation",
 "8. Configuring the memory cache",
 "11. Difficulties",
 "10. Adding LDAP support",
 "Chapter 5. File cloud",
 "1. Creating a Network Share",
 "3. Mounting share from a remote client",
 "2. Testing share definitions using smbclient",
 "Chapter 6. Network file systems served by Samba",
 "Documentation &#34;Software Defined Infrastructure&#34; in summer term 2020 (Group 8)"
];
wh.search_wordMap= {
"dns3": [3],
"upload": [31,[29,35]],
"dns1": [3],
"sslcertificatekeyfil": [[31,39]],
"your": [[35,49]],
"via": [[1,31]],
"these": [[23,35]],
"describ": [16],
"would": [[26,31]],
"a2ensit": [[29,31]],
"permiss": [42,39],
"vim": [37],
"ipc": [51],
"ldapmodifi": [[20,21,24,26]],
"serv": [52],
"version": [3,[8,9,11,13,16,38,46]],
"betrayer.com": [19,16],
"befor": [45],
"folder": [39,42,[1,23,31]],
"size": [3,[8,9,11,13,49]],
"util": [5],
"stop": [23],
"handl": [[6,22]],
"guest": [49],
"chapter": [[2,12,28,36,48,52]],
"browseabl": [49],
"olcsyncrepl": [26],
"allowoverrid": [[29,30,31,39]],
"role": [49],
"php-intl": [37],
"least": [46],
"manual": [[30,32],29],
"suffici": [39],
"result": [19,27,14,[17,20,22]],
"entryuuid": [[24,26]],
"reconnect": [14],
"after": [[26,32,51],[13,16,33,49]],
"machin": [23,22,[32,49]],
"serverauth": [31],
"connect": [27,[1,14,18,47]],
"address": [4,[7,17]],
"abl": [[14,20,33,34,49]],
"supdat": [49],
"aaaa": [3,11],
"the": [23,[29,49],26,22,31,[39,46],[4,30],[7,14,20,24,42],47,[13,18,25,45],[6,16,32,50,51],[19,37,41,43,44],[1,5,15,17,33,34,35],[0,21,38]],
"snew": [49],
"imag": [17],
"arch": [19],
"goe": [49],
"thu": [[8,9,11]],
"correct": [[42,46]],
"replic": [25,[24,26]],
"stud": [14],
"opcache.en": [45],
"acl": [4],
"got": [3,[8,9,11,13,19,20]],
"database-us": [43],
"finish": [44],
"export": [16],
"pam": [49],
"req": [31],
"add": [[21,24,26],[7,20,30]],
"ldap-account-manag": [34],
"initi": [25],
"need": [[7,25,29,30,49]],
"chown": [42,23,39],
"check": [[6,13,26,49,50]],
"authnz_ldap": [32],
"list": [51],
"respect": [[14,16]],
"binddn": [26],
"php-curl": [37],
"success": [19,14,[22,29]],
"sync-provid": [24],
"http": [34],
"sdi8b.mi.hdm-stuttgart.de.conf": [29],
"webmast": [[29,30,31,39]],
"local4": [20],
"trust": [4,[31,43]],
"cif": [50],
"php-simplexml": [37],
"prevent": [22],
"phpmyadmin": [33,[0,1]],
"accomplish": [[29,49]],
"softwar": [19,16,0,[18,21,27,53]],
"root": [49,[1,51],50,[0,15,41,42]],
"scope": [14,19],
"combin": [[29,30,31,39]],
"end": [42],
"hard": [46],
"flci77iqx": [20],
"modifi": [26,24,21],
"cakey": [31],
"otherwis": [7],
"printabl": [49],
"subjectaltnam": [31],
"anyth": [49],
"env": [39],
"ldap.conf": [14],
"with": [19,[29,31],[14,20,47],[13,21,49,50],[16,18,23,32,33,38,41,43,44,46,51]],
"slapd.conf": [20],
"certif": [31,39],
"msec": [3,[8,9,11,13]],
"there": [46],
"well": [13],
"betray": [[16,19],26,[21,34],[15,18,24,27,32]],
"syntax": [49],
"tls": [31],
"directori": [29,[31,39,42,49],30,[32,35],[4,14,16,23,51]],
"listen-on": [4],
"backup": [23,49],
"told": [22],
"ns.heise.d": [11],
"desir": [[20,29,49]],
"rid": [26],
"number": [[7,14]],
"e1ntsef9ovnyte5xnyttrdd1awxbmxp0ufbmws9gbenpnzdpuxg": [16],
"ca-csr.conf": [31],
"identifi": [41],
"variabl": [45],
"specifi": [20],
"write": [20],
"order": [30,[25,29,49]],
"newli": [30],
"treesuffix": [34],
"php-xmlwriter": [37],
"organizationalrol": [16],
"connection.simple_bind_": [27],
"script": [42,43],
"exit": [41],
"system": [[20,22,37,41,52]],
"driver": [[49,51]],
"cmd": [3,[8,9,11,13]],
"d1ce": [11],
"other": [18],
"increas": [[7,49]],
"save": [7],
"complete-nc-installation-on-debian": [37],
"login": [44,[20,22,33,47]],
"restrict": [49],
"local": [[30,45]],
"valid": [49,31,4],
"slapd.d": [23],
"vogt": [53],
"interfac": [34],
"top": [16,19],
"too": [14],
"search_bas": [27],
"locat": [29,35],
"have": [7],
"share": [49,[50,51],[1,29,30]],
"sdi8b.csr": [31],
"givennam": [[16,19]],
"libapache2": [37],
"server_uri": [27],
"avail": [35],
"extfil": [31],
"question": [3,[8,9,11,13]],
"cach": [[7,45],[4,22]],
"notic": [46],
"sdi8b.crt": [31,39],
"doc.conf": [32],
"exampl": [[3,14,17,29,30]],
"php": [46,[43,45]],
"com": [19,16,26,[21,34],[15,18,24,27,32]],
"instal": [37,29,[5,15,33,43],[34,38,44,49,51],[14,22,39,46,47]],
"subnet": [7],
"replica": [[0,23,25]],
"php-mcrypt": [37],
"spool": [49],
"remot": [50,[20,51]],
"reconfigur": [14],
"objectclass": [16,14,19,24,21],
"correspond": [[30,32]],
"mode": [4],
"sd7uila1ztppli": [20],
"webserv": [33],
"etc": [7,31,[23,39,49],[4,6],[13,14,20,22,29,32,45]],
"whether": [26],
"olcmoduleload": [[24,26]],
"lam": [34],
"ldapv3": [14,19],
"sdi8b-crs.conf": [31],
"all": [[19,29,31,39],[14,30,46],[20,23,35,37,41,49]],
"new": [[26,31,39],[7,20]],
"read": [49],
"mi.hdm-stuttgart.d": [7,13,[8,14],9,[27,47]],
"htgroup": [42],
"tri": [26],
"revers": [[3,7,9]],
"tool": [14],
"x509": [31],
"were": [[14,20,22,31,33,34,46]],
"therefor": [39],
"subtre": [14,19],
"basic": [32],
"pop-hannover.net": [11],
"unix": [49],
"expir": [7],
"websit": [29],
"apache_log_dir": [[29,30,31,39]],
"keyencipher": [31],
"php-json": [37],
"tsl": [31],
"vanhe": [53],
"nv012": [29,[30,31,39]],
"error.log": [[29,30,31,39]],
"reload": [[4,6],[7,13]],
"ldap.scope_onelevel": [27],
"and": [23,[1,4,20,31,33,42,46,47],[21,22,25,30,40],[0,5,6,14,18,19,26,29,32,34,35,38,39,41,43,44,49,51]],
"chmod": [42],
"panic-act": [49],
"dump": [[16,49]],
"attr": [27],
"ani": [4],
"skobowski": [14,53],
"ann": [[16,19]],
"e68": [11],
"accord": [21],
"rsyslog": [20],
"ttl": [7],
"obey": [49],
"respond": [50],
"wasn\'t": [14],
"password": [49,[1,50],[18,33,51]],
"slapadd": [23],
"let": [49],
"state": [47],
"php.ini": [45],
"rlimit_max": [49],
"press": [49],
"app": [[42,46,47]],
"apt": [37,29,[5,33,34]],
"inetorgperson": [19,[14,16]],
"smb.conf": [49],
"mount": [50,51],
"each": [30,7],
"databas": [41,[20,23],[0,24,33,40,43]],
"letter": [19],
"php-mbstring": [37],
"document": [29,35,[7,53]],
"ztnodfpevjlzvmhltdjkbfzrrjjurfjftms5ce1gukxjrghqttnvdlluwlfa": [16],
"mainten": [43],
"two": [46],
"opcache.interned_strings_buff": [45],
"default": [4,29],
"found": [[8,9,11,13]],
"usernam": [[1,29,33,47]],
"are": [32],
"sudo": [[37,43,50]],
"latest": [38],
"tagesschau.d": [3],
"sslcertificatefil": [[31,39]],
"refresh": [7],
"cest": [3,[8,9,11,13]],
"call": [29],
"mariadb-serv": [[33,37]],
"googl": [4],
"ownership": [39],
"thing": [37],
"definit": [[49,51]],
"olcrootpw": [20],
"smith": [19,16],
"lib": [[23,34,49]],
"nano": [49],
"run": [[4,5,15,29,32,49]],
"had": [[5,14,39,46,49,50]],
"either": [19],
"authtyp": [32],
"index.html": [29],
"keyword": [[29,30]],
"those": [46],
"recurs": [4,11],
"difficulti": [46],
"actual": [23],
"last": [[13,31]],
"dure": [[22,47]],
"sync": [[26,49]],
"alia": [[29,39],31,[30,35]],
"opcache.max_accelerated_fil": [45],
"root.mi.hdm-stuttgart.d": [7],
"hallo": [[29,50]],
"warn": [[49,51]],
"aug": [3],
"nc_data": [42],
"privat": [31,4],
"name": [7,14],
"page": [[29,42,46]],
"next": [[7,22,23,29,30,31,33,49]],
"import": [27,[4,24,26]],
"htuser": [42],
"becaus": [49],
"show": [[17,22,47,49]],
"kjyzuhbpq": [16],
"effort": [46],
"devel": [19,16,[18,21,27]],
"non": [18],
"servernam": [30,[29,31,39]],
"comput": [30],
"not": [[7,13,18,26,39,46]],
"privileg": [41],
"sdi8a.mi.hdm-stuttgart.d": [8,[7,26],[0,1,9,32]],
"florian": [14,53],
"now": [23,[14,18,20,31,32,35,44,46]],
"samba": [49,51,50,[0,1,52]],
"enabl": [40,[4,20,22,29,31,32,39]],
"overview": [[1,2]],
"associ": [40],
"yes": [49,4],
"was": [[29,46],[14,37,49],[13,19,22,30,32,39,44]],
"start": [19,[23,40]],
"ouser": [50],
"ssuccess": [49],
"php-imagick": [37],
"ptr": [[3,7,9]],
"hdm": [[27,31,47],[4,14,46]],
"chang": [4,[7,30,49],[6,22,24,26]],
"financi": [16],
"noerror": [3,[8,9,11,13]],
"time": [3,[7,8,9,11,13]],
"iz-net": [3],
"window": [51,49],
"studio": [[14,16]],
"sdi9a": [51],
"shadow": [22],
"authnam": [32],
"heise.d": [11],
"program": [49],
"ns2": [11],
"ns1": [3],
"when": [3,[8,9,11,13]],
"galleri": [47],
"jim": [19,16],
"ns5": [3],
"ns8": [7,[8,9,13]],
"sdi8bnextclouddbpassword": [[1,41,43]],
"posixaccount": [[14,21]],
"enter": [49,51],
"case": [49,29],
"give": [[1,23,39]],
"applic": [1,27],
"modul": [[24,26,31,32]],
"memori": [45],
"modify_client.ldif": [26],
"sdi8": [27],
"authent": [32],
"slide": [16],
"tabl": [1,0],
"apache2": [29,31,39,[32,40],[30,37,44,45]],
"log": [49,[20,47],34],
"spassword": [49],
"php-xmlreader": [37],
"unzip": [[37,38]],
"freedoc": [16],
"web": [34,[0,31,32,36]],
"hdmaccount": [14],
"req_extens": [31],
"theme": [42],
"sult": [19],
"hdmcategori": [14],
"workgroup": [51],
"tutori": [[42,46]],
"deamon": [22],
"ssha": [20],
"ldap.initi": [27],
"wrong": [49],
"sharenam": [51],
"usag": [22],
"serveralia": [30,[29,31,39]],
"chat": [49],
"advanc": [46],
"apt-get": [49,51],
"shut": [22],
"credenti": [1,26,[32,33,34,47]],
"ldap-util": [14],
"ncdata": [42],
"section": [3,[8,9,11,13,49],[4,45]],
"smbpasswd": [49],
"listen": [4],
"cloud": [[37,48]],
"extendedkeyusag": [31],
"major": [46],
"ldap": [27,22,32,14,[23,47],[24,26],[0,1,17,34,46],[16,20,21,25,28]],
"zone": [7,13],
"idmap": [49],
"syncprov.la": [[24,26]],
"day": [31],
"bean": [19,16,[18,21],[22,27]],
"group": [[22,47,53]],
"olclogfil": [20],
"refreshon": [26],
"profil": [18],
"www.sdi8b.mi.hdm-stuttgart.d": [[29,31,39]],
"kind": [46],
"nc_perm.sh": [42],
"class-c": [7],
"both": [26],
"effect": [49],
"exchang": [13],
"achiev": [[22,32]],
"option": [4,3,[8,9,11,13,29,30,31,39,49,51]],
"udp": [3,[8,9,11,13]],
"request": [[14,31],[4,19]],
"generat": [31,39],
"insert": [50],
"slapcat": [23],
"point": [40],
"stretch-and-manual-upd": [37],
"browser": [[29,31]],
"messag": [[20,51]],
"prerequisit": [37],
"easi": [14],
"virtualhost": [[29,30,31,39]],
"nextcloud": [39,43,[38,41],[42,44],[1,46],[0,37]],
"sdi8b": [1,[22,26,33,34,51]],
"sdi8a": [[1,26],[21,22,24]],
"process": [49,[22,47]],
"move": [[38,42]],
"attribut": [19,20,[21,24,26]],
"admin-us": [43],
"also": [39],
"differ": [14],
"mariadb": [40,[33,41],1],
"nsswitch.conf": [22],
"various": [1],
"mean": [26],
"simplesecurityobject": [16],
"bindmethod": [26],
"user": [49,[18,23,47],[14,22,32],[19,20,34,39,41]],
"proxi": [49],
"ns.plusline.d": [11],
"extens": [[29,30,31]],
"sha256": [31],
"bad": [49],
"mime": [39],
"addit": [3,[8,9,11,13],29],
"path": [49,[7,23,29,30,35]],
"bind": [7,4,[6,18],[5,13]],
"record": [[7,13]],
"mkdir": [42],
"you": [7,32],
"ns.s.plusline.d": [11],
"aa": [[8,9,13]],
"ad": [47,[13,26,30,32,35,41,43,45,49]],
"sure": [[29,39]],
"smbd": [49],
"rsyslog.d": [20],
"automat": [40],
"an": [46,[1,14,15,21,35]],
"panic": [49],
"extend": [14,[19,21]],
"as": [[16,33],[4,14,18,20,41,47]],
"at": [40,[7,14,37,46]],
"configur": [26,[13,20,23,24],[4,29],[7,30,39,43,45,46],[17,22,25,31,34,35,40,41,47]],
"allow-recurs": [4],
"domain": [[30,51],[13,29,43]],
"sdi": [4],
"descript": [16],
"organ": [16],
"be": [7,[46,49]],
"documentroot": [[29,30,31,39]],
"latest.zip": [38],
"www-data": [39,42,43],
"digitalsignatur": [31],
"nonrepudi": [31],
"uid": [19,14,16,27,[18,21,22]],
"see": [51,[4,14,18,49]],
"search": [19,14],
"releas": [38],
"bw": [31],
"libpam-ldapd": [22],
"sslengin": [[31,39]],
"by": [22,[15,29,41],[13,14,17,19,20,24,26,27,31,35,39,43,49,51,52]],
"php-gd": [37],
"term": [53],
"ca": [31],
"cd": [39],
"set": [42,[15,49],[4,7,20,23,26,32,35,40,44]],
"contain": [23,[24,26]],
"homedirectori": [21,14],
"access.log": [[29,30,31,39]],
"cn": [26,24,16,[14,19,20,31],[21,34]],
"right": [46],
"cp": [49],
"figur": [46],
"aptitud": [15],
"renam": [42],
"organizationalperson": [19,16],
"answer": [3,[8,9,11,13]],
"infrastructur": [53],
"apach": [39,[0,14,16,29,33,36,40,41,44]],
"under": [34,[14,32,35,43,44,45,47]],
"config": [[26,49],24,20,[31,34,42,43]],
"db": [7],
"did": [13],
"dc": [19,16,14,26,[21,27,34],[15,18,24,32]],
"test.txt": [50,51],
"de": [14,31,27],
"dig": [3,13,[8,9,11]],
"belwue.d": [3],
"shadowaccount": [14],
"opcache.revalidate_freq": [45],
"dn": [16,[24,26],14,[19,20,21]],
"extern": [20],
"do": [[16,33,37,46,47]],
"dir": [39],
"down": [22],
"dit": [[15,16]],
"searchbas": [26],
"named.conf.loc": [6,7],
"startup": [40],
"sites-avail": [[29,31]],
"named-checkconf": [6],
"which": [29,[26,49],[23,24,30,44,46,50]],
"brows": [14],
"download.nextcloud.com": [38],
"test": [50,16,[10,18,22,29,51]],
"ldif": [[14,23],[19,21]],
"rcvd": [3,[8,9,11,13]],
"configuration-repl": [26],
"sslcertificatechainfil": [[31,39]],
"eq": [[24,26]],
"never": [26],
"take": [49],
"ldapsearch": [19,14],
"adjust": [[39,43,45]],
"final": [[31,47]],
"activ": [[24,26],[31,47]],
"some": [39],
"virtual": [30],
"fi": [42],
"origin": [49],
"for": [31,[29,39],[19,20,24,30,46],[1,3,4,7,13,14,17,18,26,32,35,41,49]],
"cname": [7],
"ldap.log": [20],
"testparm": [49],
"content": [[24,26,29,31,50]],
"timeout": [26],
"miss": [42],
"database-pass": [43],
"syncprov": [24],
"load": [49,[7,31]],
"stuttgart": [31],
"nscd": [22],
"olcoverlay": [24],
"client": [26,[17,25],[50,51]],
"just": [14,41],
"over": [1],
"owner": [23],
"dnssec-en": [4],
"retri": [[7,26]],
"home": [29,[31,39],[35,49],14,[21,51]],
"michael": [14,53],
"print": [49,51],
"publish": [35],
"xmlmind": [29],
"setup": [[22,33,39]],
"restor": [23,49],
"grant": [[29,31,39],[30,35,41]],
"prompt": [31,[49,50]],
"expert": [46],
"sdi8b.mi.hdm-stuttgart.de-ssl": [31],
"bin": [14,[42,49]],
"openldap": [23,15],
"occ": [[42,43]],
"retyp": [[46,49]],
"output": [[49,51]],
"hdm-stuttgart": [14,27],
"action": [49],
"id": [3,[8,9,11,13,22]],
"https": [[31,35,37,38,44]],
"dunkel.d": [3],
"if": [42,51],
"creat": [[31,49],[20,30],42,[1,18,21,23,24,25,26,29,32,41,47,51]],
"python": [27],
"il": [19],
"in": [3,11,7,[13,29],49,[8,9,47],[4,30],[14,31,46],[16,17,20,22,25,34,50,53]],
"mod-php": [37],
"made": [[23,39]],
"ip": [4],
"printer": [49,51],
"dns": [4,31,[0,3,5,11,13,14,30,49]],
"anonym": [14],
"index": [[24,26,29,30,31,39]],
"is": [29,49,25,[4,7,35,46,51]],
"php-mysql": [37],
"it": [42,[18,20,21,46,47,49],[5,7,23,26,30,33,38]],
"manag": [[33,34]],
"decid": [49],
"field": [14],
"loginshel": [14],
"invalid": [22],
"doc": [29,35,30,[31,39]],
"connection.unbind": [27],
"php-zip": [37],
"status": [3,[8,9,11,13]],
"numrespons": [19,14],
"server": [[4,23],31,[0,13,39],7,[1,14,15,32,49,51],[3,5,8,9,11,25,33,40],[16,17,22,30,34,36,38,41,43,44,47]],
"valu": [[19,20]],
"pprint": [27],
"enrol": [14],
"hdmstudent": [14],
"standalon": [49],
"paramet": [23,[14,49]],
"smb": [49],
"summer": [53],
"mention": [7],
"file": [49,[7,20,22,23,29,30],[24,26,31,51],[1,14,21,35,37,39,42,43,45,48,52]],
"olcoverlayconfig": [24],
"keyusag": [31],
"rootca.pem": [31],
"database-nam": [43],
"map": [[7,39,49]],
"may": [[8,9,11,13]],
"add_olcrootpw.ldif": [20],
"max": [49],
"forward": [4,[7,8,44]],
"auth-nxdomain": [4],
"could": [[47,50],[13,14,18,31,42,44,51]],
"trusted_domain": [43],
"database-repl": [26],
"manual.mi.hdm-stuttgart.d": [30],
"off": [26],
"url": [35],
"dataencipher": [31],
"genrsa": [31],
"soa": [7],
"mail": [13,[14,16,17,19]],
"use": [[14,23,51],[1,13,15,16,17,18,19,22,24,26,29,30,33,34,37,39,41,49]],
"db.mi.hdm-stuttgart.d": [7,13],
"ls": [50],
"ns.pop-hannover.d": [11],
"sign": [31],
"while": [46,25],
"admin-pass": [43],
"userpassword": [16],
"second": [[18,23]],
"that": [[29,46],[7,13,14,22,31,39,42,51]],
"index.php": [44],
"olcdatabas": [[24,26],20],
"config.ldif": [23],
"usr": [49,[29,30]],
"find": [42,14],
"www": [42,39,29,[30,31],[38,43]],
"host": [30,[7,39]],
"limit": [49],
"outdat": [46],
"mi": [31,46],
"administr": [[16,33]],
"entri": [26,[13,19,21,30]],
"author": [3,[8,9,11,13]],
"opcod": [3,[8,9,11,13]],
"difficult": [[14,46]],
"zhnnb2lqczk4ji8om2hun2yzuisjmymrwqcokcknej05acknoxpoyzg5n3o3": [16],
"mv": [[38,42]],
"mdb": [[24,26]],
"mx": [13],
"fill": [20],
"servic": [49,[6,23],[4,13,20,31,40,44,51]],
"config.php": [43],
"disk": [51],
"task": [46,[13,22,37,39,41]],
"www8": [7],
"rewrit": [39],
"header": [3,[8,9,11,13,39]],
"updat": [42,[4,29,34,49]],
"nikla": [53],
"modify_bean.ldif": [21],
"no": [49,[4,31],1],
"code": [49],
"p4": [3,[8,9,11,13]],
"ns": [3,11,7,[8,9,13]],
"authldapurl": [32],
"sql": [41],
"dialog": [15],
"execut": [42,[6,14,20,22,33,41,43]],
"hdm-stuttgart.d": [3,14,13],
"ipv4": [[4,7]],
"ipv6": [4],
"of": [49,[39,46],[18,23,30],[4,7,22,29,31,50]],
"dpkg-reconfigur": [[15,33]],
"possibl": [[42,47]],
"backend": [[47,49]],
"ok": [49],
"gidnumb": [21,14],
"make": [[29,46,47,49]],
"olcdbindex": [[24,26]],
"on": [23,[26,32],[0,4,16,22,31,39,41,46,49]],
"opcache.enable_c": [45],
"sdi8bnextcloudadminpassword": [[1,43]],
"purpos": [29],
"or": [[19,26]],
"pseudosect": [3,[8,9,11,13]],
"os": [51],
"ou": [16,19,27,[18,21],[14,31]],
"master": [[7,24,25,26],51],
"betrayerorg": [16],
"sdi8b.key": [31,39],
"vennam": [19],
"satement": [41],
"ncpath": [42],
"ssh": [1],
"bind9": [[4,5,6]],
"ssl": [31,39],
"cover": [39],
"necessari": [[22,32,37,39]],
"search_filt": [27],
"they": [31],
"qr": [3,[8,9,11,13]],
"edit": [[29,49]],
"them": [[30,31,40]],
"then": [42,[14,23,49],[29,31],[6,19,20,21,22,38,43,46,47,50,51]],
"ra": [3,[8,9,11,13]],
"php-xml": [37],
"node": [31],
"rd": [3,[8,9,11,13]],
"includ": [30],
"passwd": [49,22],
"a2enmod": [39,32,31],
"customlog": [[29,30,31,39]],
"sub": [19,14],
"access": [29,[1,17,20,27,30,31,32,33,51]],
"deprec": [[49,51]],
"global": [[3,4,49],[8,9,11,13]],
"syslog": [49,51],
"current": [46],
"sh": [14],
"defin": [[19,53]],
"sn": [[14,16,19]],
"so": [[31,33,41,42]],
"key": [31,1],
"email": [17],
"redirect": [[29,30]],
"st": [31],
"stat": [20],
"changetyp": [[24,26],21],
"one": [[18,23]],
"reinstal": [46],
"interv": [26],
"appear": [26],
"oper": [18],
"to": [49,30,20,[22,29],[7,23,31,32,46],[4,33,35,37,39,42,47],[5,6,14,25,26,34,44],[13,15,17,21,24,38,40,41,43,45,50,51]],
"v3": [31],
"but": [[18,46]],
"user_nam": [49],
"afterward": [15],
"organizationalunit": [16,19],
"olcsyncprovconfig": [24],
"sdi8b.mi.hdm-stuttgart.d": [31,39,29,44,[0,1,27,32,33,34,35,43,50]],
"sever": [46],
"mysql": [[0,33,41,43]],
"up": [49,[7,15,23,26,32,35,40,42,44]],
"written": [46],
"us": [49],
"mv068": [[29,31,39]],
"www.manual.mi.hdm-stuttgart.d": [30],
"this": [31,[19,32,47],[4,7,16,22,35,37,40,46,49,50]],
"opcache.memory_consumpt": [45],
"look": [16],
"daemon": [22],
"distinguished_nam": [31],
"opt": [3,[8,9,11,13]],
"vi": [42],
"print0": [42],
"vm": [22],
"subdomain": [30],
"guid": [[33,37]],
"support": [47,31],
"sinc": [4],
"allow": [[1,4,49]],
"userlist": [14,27],
"jectclass": [19],
"systemctl": [40,44],
"admin": [[20,26,34],[1,16,47],[18,21,24]],
"everi": [30],
"we": [31,[29,49],14,[22,23],[20,33,39,42,47],[4,30,51],[7,13,26,34,50],[6,15,18,19,21,24,32,41,43,44,45,46],[1,5,16,17,25,35,37,38,40]],
"printf": [42],
"flush": [41],
"appli": [[4,6,21,24,26]],
"queri": [3,11,[8,9,13],19,[4,22]],
"debian": [51,3,[8,9,11,13]],
"help.nextcloud.com": [37],
"mask": [49],
"middl": [46],
"previous": [[39,41]],
"xarg": [42],
"again": [46],
"distribut": [0],
"role_standalon": [49],
"mnt": [50],
"popul": [16],
"step": [[29,49]],
"bash": [42],
"comment": [49,51],
"mark": [4],
"base": [[14,19],[22,34]],
"iz-www": [3],
"sdi8b-csr.conf": [31],
"mod": [39],
"errorlog": [[29,30,31,39]],
"in-addr.arpa": [3,9,7],
"type": [42,[7,26],[14,51]],
"mon": [3,13],
"consist": [29],
"sdi8bsamba": [[1,49]],
"connection.search_": [27],
"numentri": [19,14],
"goal": [32],
"var": [42,39,[29,49],[20,30,31,38],[4,23,34,43]],
"work": [[18,26,46]],
"exist": [[14,21,41]],
"serveradmin": [[29,30,31,39]],
"itself": [49],
"listen-on-v6": [4],
"openssl": [31],
"flag": [3,[8,9,11,13]],
"lam.conf": [34],
"wget": [38],
"ldap1": [14,[27,47]],
"copi": [42],
"requir": [39,[29,31],[30,32,35,46,49]],
"our": [29,[14,31,49],[22,23,39],[32,34],[17,20,30,33,35,40,41,47],[1,4,13,16,43,44,50,51]],
"tls_reqcert": [26],
"out": [31,46],
"followsymlink": [[29,30,31,39]],
"packag": [29,[14,22,37,38,46]],
"gruppen": [22],
"restart": [40,[44,49],[20,22,23,31,32]],
"authbasicprovid": [32],
"token": [14],
"filter": [14,19],
"site": [31,[35,39]],
"sync-modul": [[24,26]],
"entrycsn": [[24,26]],
"sambashar": [49,51,[1,50]],
"minimum": [49],
"first": [23,[14,20,24,29,31,32,37,43,49,51]],
"msg": [3,[8,9,11,13]],
"dcobject": [16],
"ldapi": [20],
"rootca.key": [31],
"data": [23,42,22,[3,16,17]],
"htaccess": [42],
"own": [[29,31]],
"separ": [30],
"fs120": [14,[29,31,39]],
"alt_nam": [31],
"tab": [46],
"modify_master.ldif": [24],
"simpl": [26,[32,51]],
"eduperson": [14],
"from": [[23,27,31],[1,4,24,26,39,41,42,49,50,51]],
"html": [29],
"slapd": [[15,23]],
"depart": [19,16,[18,21,27]],
"replac": [29],
"localhost": [[1,29,30,31,39,41,43,51]],
"thunderbird": [17],
"ubuntu": [29],
"onli": [4,49,[1,47]],
"dns-bind": [12],
"edn": [3,[8,9,11,13]],
"mistud": [27],
"olcloglevel": [20],
"person": [19,16,1],
"usershar": [49],
"chain.txt": [[31,39]],
"here": [[7,32]],
"smbclient": [51],
"gid": [22],
"line": [[22,32,35]],
"opcache.save_com": [45],
"error": [6],
"network": [[4,49,52]],
"array": [43],
"cat": [50],
"rootus": [42],
"ncadmin": [[1,43]],
"recoveri": [23],
"provid": [26,[22,29,31,32,34]],
"lookup": [7,[3,8,9,17]],
"conf-avail": [32],
"named.conf.opt": [4],
"will": [7],
"cacreateseri": [31],
"mx1": [13],
"follow": [49,[24,26],[1,14,16,19,22,32,33,37,41,45,47,50]],
"instead": [39],
"command": [49,[23,29,50],[6,14,24,26,46]],
"sdidoc": [29,[31,39],35],
"tdb": [49],
"serial": [7],
"uidnumb": [21,14],
"data.ldif": [23],
"negat": [7],
"schemacheck": [26]
};
