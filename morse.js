var sep = " ";
var morse = { 'A':'.-', 'B':'-...', 'C':'-.-.', 'D':'-..', 'E':'.', 'F':'..-.', 'G':'--.', 'H':'....', 'I':'..', 'J':'.---', 'K':'-.-', 'L':'.-..', 'M':'--', 'N':'-.', 'O':'---', 'P':'.--.', 'Q':'--.-', 'R':'.-.', 'S':'...', 'T':'-', 'U':'..-', 'V':'...-', 'W':'.--', 'X':'-..-', 'Y':'-.--', 'Z':'--..', '1':'.----', '2':'..---', '3':'...--', '4':'....-', '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.', '0':'-----', ', ':'--..--', '.':'.-.-.-', '?':'..--..', '/':'-..-.', '-':'-....-', '(':'-.--.', ')':'-.--.-'};
console.log(morse);
function crypt(messaggio) {
	var output = "";
	messaggio = messaggio.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
	for (x of messaggio) {
		if (x.match(/^[a-z0-9]+$/i)) { 
			output += morse[x] + sep;
		} else if (x == " ") {
			output += " / ";
		} else {
			output += "";
		}
	}
	return output;

}
function decrypt(messaggio) {
	var output = "";
	messaggio = messaggio.split(" ");
	for (x of messaggio) {
		if (x.includes("-") || x.includes(".")) {
			output += Object.keys(morse).find(key => morse[key] === x);
		} else if (x.includes("/")) {
			output += " ";
		} else {
			output += "";
		}
	}
	return output;
}
module.exports = {
	crypt:
	crypt,
	decrypt:
	decrypt,
};
