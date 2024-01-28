// import {AgoraRTC} from '/assets/AgoraRTC_N-4.20.0.js'

(function init(){
	
	let minimised=false;
	document.getElementById('minimise').onclick=function(){
		if (!minimised){
			document.getElementById('dash_div').style.width='8vw'
			for (let k of document.querySelectorAll('.dash_btns')){
				if (k.id!='minimise'){
					k.childNodes[2].style.display='none'
					k.childNodes[2].style.transition='0.5s'
				}
			}
			document.getElementById('dash_txt').childNodes[2].style.display='none'
			setTimeout(()=>{
				document.getElementById('minimise_caret').style.transform='rotateZ(180deg)';
				document.getElementById('minimise_caret').style.left='0%'

			},1500)
			minimised=true
		}
		else{
			document.getElementById('dash_div').style.width='20vw'
			setTimeout(()=>{
				document.getElementById('minimise_caret').style.transform='rotateZ(360deg)';
				document.getElementById('minimise_caret').style.left='40%'
			},1500)
			setTimeout(()=>{
				for (let k of document.querySelectorAll('.dash_btns')){
					if (k.id!='minimise'){
						k.childNodes[2].style=''
					}
				}

			},500)
			document.getElementById('dash_txt').childNodes[2].style=''
			
			minimised=false

		}
			

	}

})();
