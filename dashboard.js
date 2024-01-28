import {auth,db} from '/config.js'

(async function init(){
	
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
	
	document.getElementById('admins_view').onclick=async function(){
		await db.collection('admins').get().then(async (r)=> {
			await r.docs.map(async(g) => {
				let extract_UID=await auth.currentUser.email.split('@')[0].split('.')[1]
				console.log(extract_UID)
				if (g.id.split('.')[2].includes(extract_UID)){
					var office_bearer_tbl=document.createElement('table')
					office_bearer_tbl.style='width:100%;height:100%;border-collapse:collapse;'
					office_bearer_tbl.innerHTML=`
						<tr>
							<td style='width:5%;'></td>
							<td style='width:30%;'></td>
							<td style='width:30%;'></td>
							<td style='width:30%;'></td>
							<td style='width:5%;'></td>
						</tr>

						
					`
					document.getElementById('widg_cont').appendChild(office_bearer_tbl)
				}
			})
		})
	}


})();
