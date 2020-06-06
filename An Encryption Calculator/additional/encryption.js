		function getCaretPosition(ctrl) {
			var CaretPos = 0; 
			if(document.selection) {
				ctrl.focus();
				var Sel = document.selection.createRange();
				Sel.moveStart('character', -ctrl.value.length);
				CaretPos = Sel.text.length;
			} else if(ctrl.selectionStart || ctrl.selectionStart == '0') {
				CaretPos = ctrl.selectionStart; 
			}

			return CaretPos;
		}

		function setCaretPosition(ctrl, pos) {
			if(ctrl.setSelectionRange) {
				ctrl.focus();
				ctrl.setSelectionRange(pos, pos);
			} else if(ctrl.createTextRange) {
				var range = ctrl.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		}

		function computeDES() {
			const msgDOM = document.getElementById('msg');
			const keyDOM = document.getElementById('key');

			let caretPos = getCaretPosition(document.activeElement);

			msgDOM.value = (msgDOM.value.toUpperCase().replace(/[^0-9A-F]/, '') + '').substring(0, 16); 
			keyDOM.value = (keyDOM.value.toUpperCase().replace(/[^0-9A-F]/, '') + '').substring(0, 16); 

			setCaretPosition(document.activeElement, caretPos);

			const msg = msgDOM.value;
			const key = keyDOM.value;
			let encryption = DES(msg, key);

			const ciphertextDOM = document.getElementById('ciphertext');
			ciphertextDOM.value = encryption;

		}

		function DES(msg, key) {

			let base2 = {
				'0': '0000',
				'1': '0001',
				'2': '0010',
				'3': '0011',
				'4': '0100',
				'5': '0101',
				'6': '0110',
				'7': '0111',
				'8': '1000',
				'9': '1001',
				'A': '1010',
				'B': '1011',
				'C': '1100',
				'D': '1101',
				'E': '1110',
				'F': '1111'
			}

			msg_2 = msg.split('').map(x => base2[x]).join('');

			key_2 = key.split('').map(x => base2[x]).join('');

			const PC_1 = [
				57, 49, 41, 33, 25, 17, 9,
				1, 58, 50, 42, 34, 26, 18,
				10, 2, 59, 51, 43, 35, 27,
				19, 11, 3, 60, 52, 44, 36,
				63, 55, 47, 39, 31, 23, 15,
				7, 62, 54, 46, 38, 30, 22,
				14, 6, 61, 53, 45, 37, 29,
				21, 13, 5, 28, 20, 12, 4
			];

			let newKey = '';
			for(i of PC_1) newKey += key_2[i - 1];

			let rotationTable = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

			let C = [newKey.substring(0, 28)];
			let D = [newKey.substring(28, 56)];

			for(let i = 0; i < 16; i++) {
				let newC = C[i],
					newD = D[i];

				let rotations = rotationTable[i];
				for(let j = 0; j < rotations; j++) {
					newC = newC.substring(1) + newC[0];
					newD = newD.substring(1) + newD[0];
				}
				C.push(newC);
				D.push(newD);
			}

			let CD = [];
			for(let i = 0; i < 17; i++) {
				CD.push(C[i] + D[i]);
			}

			const PC_2 = [
				14, 17, 11, 24, 1, 5,
				3, 28, 15, 6, 21, 10,
				23, 19, 12, 4, 26, 8,
				16, 7, 27, 20, 13, 2,
				41, 52, 31, 37, 47, 55,
				30, 40, 51, 45, 33, 48,
				44, 49, 39, 56, 34, 53,
				46, 42, 50, 36, 29, 32
			];

			K = [];
			for(let i = 0; i < 17; i++) {
				newKey = ''
				for(j of PC_2) newKey += CD[i][j - 1];
				K.push(newKey);
			}

			const initialPermutation = [
				58, 50, 42, 34, 26, 18, 10, 2,
				60, 52, 44, 36, 28, 20, 12, 4,
				62, 54, 46, 38, 30, 22, 14, 6,
				64, 56, 48, 40, 32, 24, 16, 8,
				57, 49, 41, 33, 25, 17, 9, 1,
				59, 51, 43, 35, 27, 19, 11, 3,
				61, 53, 45, 37, 29, 21, 13, 5,
				63, 55, 47, 39, 31, 23, 15, 7
			];

			let IP = '';
			for(i of initialPermutation) IP += msg_2[i - 1];

			let L = [IP.substring(0, 32)];
			let R = [IP.substring(32, 64)];

			const expand = [
				32, 1, 2, 3, 4, 5,
				4, 5, 6, 7, 8, 9,
				8, 9, 10, 11, 12, 13,
				12, 13, 14, 15, 16, 17,
				16, 17, 18, 19, 20, 21,
				20, 21, 22, 23, 24, 25,
				24, 25, 26, 27, 28, 29,
				28, 29, 30, 31, 32, 1
			];

			let SBoxes = [];

			SBoxes.push([
				14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7,
				0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
				4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0,
				15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13
			]);
			SBoxes.push([
				15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10,
				3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
				0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15,
				13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9
			]);
			SBoxes.push([
				10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8,
				13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
				13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7,
				1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12
			]);
			SBoxes.push([
				7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15,
				13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
				10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4,
				3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14
			]);
			SBoxes.push([
				2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9,
				14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
				4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14,
				11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3
			]);
			SBoxes.push([
				12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11,
				10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
				9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6,
				4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13
			]);
			SBoxes.push([
				4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1,
				13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
				1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2,
				6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12
			]);
			SBoxes.push([
				13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7,
				1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
				7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8,
				2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11
			]);

			const permute = [
				16, 7, 20, 21,
				29, 12, 28, 17,
				1, 15, 23, 26,
				5, 18, 31, 10,
				2, 8, 24, 14,
				32, 27, 3, 9,
				19, 13, 30, 6,
				22, 11, 4, 25
			];

			let xor = (s1, s2) => {
				s3 = '';
				for(let i = 0; i < s1.length; i++) {
					s3 += (s1[i] == '1') ^ (s2[i] == '1');
				}
				return s3;
			}

			let E = s => {
				output = '';
				let i;
				for(i of expand) output += s[i - 1];
				return output;
			}

			let S = s => {
				let output = '';
				let groups = s.match(/.{6}/g);
				for(let i = 0; i < groups.length; i++) {
					let group = groups[i];
					let SBox = SBoxes[i];
					let row = parseInt(group[0] + group[5], 2);
					let col = parseInt(group[1] + group[2] + group[3] + group[4], 2);
					let index = 16 * row + col;
					output += ('0000' + SBox[index].toString(2)).slice(-4);
				}
				return output;
			}

			let P = s => {
				output = '';
				let i;
				for(i of permute) output += s[i - 1];
				return output;
			}

			for(let i = 0; i < 16; i++) {

				let ER = E(R[i]);
				let KXORER = xor(K[i + 1], ER);
				let KXORERS = S(KXORER);
				let KXORERSP = P(KXORERS);

				L.push(R[i]);
				R.push(xor(L[i], KXORERSP));

			}

			let concat = R[16] + L[16];

			const invIP = [
				40, 8, 48, 16, 56, 24, 64, 32,
				39, 7, 47, 15, 55, 23, 63, 31,
				38, 6, 46, 14, 54, 22, 62, 30,
				37, 5, 45, 13, 53, 21, 61, 29,
				36, 4, 44, 12, 52, 20, 60, 28,
				35, 3, 43, 11, 51, 19, 59, 27,
				34, 2, 42, 10, 50, 18, 58, 26,
				33, 1, 41, 9, 49, 17, 57, 25
			];

			ciphertext_2 = '';
			for(i of invIP) ciphertext_2 += concat[i - 1];

			base2 = {
				'0000': '0',
				'0001': '1',
				'0010': '2',
				'0011': '3',
				'0100': '4',
				'0101': '5',
				'0110': '6',
				'0111': '7',
				'1000': '8',
				'1001': '9',
				'1010': 'A',
				'1011': 'B',
				'1100': 'C',
				'1101': 'D',
				'1110': 'E',
				'1111': 'F'
			}

			ciphertext = '';
			let chars = ciphertext_2.match(/.{4}/g);
			for(char of chars) {
				ciphertext += base2[char];
			}

			return ciphertext;			
		}

		function RC4(plain, key) {
    		function swap(S, i, j) {
        		let S0 = S.toString();
        		let t = S[i];
        		S[i] = S[j];
        		S[j] = t;  
        		return S;
   			 }

    		function convert_ascii(text) {
        		let result_arr = [];
       		 	let result = "";
        		for (let i=0; i<text.length; ++i) {
            		result = result.concat(text[i].charCodeAt(0).toString());
            		result_arr.push(text[i].charCodeAt(0));
       			}
        		return result_arr;
    		}

   			 function init(key) {
        		let S = [], T = [];
        		for (let i=0; i<256; ++i) {
           		 	S.push(i);
            		T.push(key[i % key.length]);
        		}
        		let j = 0;
        		for (let i=0; i<256; ++i) {
            		j = (j + S[i] + T[i]) % 256;
            		S = swap(S, i, j);
        		}
        		return [S, T];
    		}

    		function stream_gen(S, l) {
        		let i = 0, j = 0, K = [];
        
        		for (let n=0; n<l; ++n) {
            		i = (i + 1) % 256;
            		j = (j + S[i]) % 256;
            		S = swap(S, i, j);
            		let t = (S[i] + S[j]) % 256;
           			K.push(S[t]);
        		}

        		return K;
    		}

    		function xor(text1, text2) {
        		let result = "";
        		for (let i=0; i<text1.length; ++i) {
            		let x = (text1[i] ^ text2[i]).toString(2);
            		let l = x.length;
            		for (let j=0; j<8-l; ++j)
                		x = '0'.concat(x);
            		result = result.concat(x);
        		}
        		let l = result.length % 4;
        		for (let i=0; i<l; ++i)
            		result = '0'.concat(result);
        		return result;
    		}

   		 	function convert(text) {
       		 	let result = "";
       		 	let arr = [];
      		  	t1 = BIN_TABLE;
       		 	t2 = HEX_TABLE;
       		 	for (let i=0; i<text.length; i+=4)
        		    arr.push(text[i].concat(text[i+1], text[i+2], text[i+3]));
       		 	for (let i=0; i<arr.length; ++i) {
          		  	let n = t1.indexOf(arr[i]);
           		 	result = result.concat(t2[n]);
       		 	}

       			 return result;
   		 	}

			let HEX_TABLE = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
			let BIN_TABLE = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111', '1000', '1001', '1010', '1011', '1100', '1101', '1110', '1111'];

    		let p = convert_ascii(plain);
   			let k = convert_ascii(key);
   			let ST = init(k);
    		let K = stream_gen(ST[0], p.length);
    		let result = xor(p, K);
    		result = convert(result);
    
    		return result;
		}

		function computeRC4() {
			const msgDOM = document.getElementById('msg');
			const keyDOM = document.getElementById('key');

			let caretPos = getCaretPosition(document.activeElement);

			setCaretPosition(document.activeElement, caretPos);

			const msg = msgDOM.value;
			const key = keyDOM.value;
			let encryption = RC4(msg, key);

			const ciphertextDOM = document.getElementById('ciphertext');
			ciphertextDOM.value = encryption;

		}

		function show(){

			let temp = document.getElementsByName("choose");
			for(i=0;i<temp.length;i++){
				if(temp[i].checked==true && temp[i].value=='DES'){
					computeDES();
					break;
				}else if(temp[i].checked==true && temp[i].value=='RC4'){
					computeRC4();
					break;
				}
			}

		}