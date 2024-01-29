import {auth,db,storage} from '/config.js'

(async function init(){
	function scroll_on_hover(ele){
		ele.onmouseover=function(){
			ele.style.overflowY='auto'
		}
		ele.onmouseout=function(){
			ele.style.overflowY='hidden'
		}
	}
	
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
	//await auth.signInWithEmailAndPassword('vishwaa3_c-603.333626@neigbhonet.com','Webdev@27')
	document.getElementById('admins_view').onclick=async function(){
		let office_bearer_tbl=document.createElement('table')
		office_bearer_tbl.style='width:95%;height:100%;border-collapse:collapse;margin:auto;'
		office_bearer_tbl.innerHTML=`
			<tr>
				<th style='width:25%;height:8vh;font-family:Josefin;color:white;border:1px solid white;font-size:20px;font-weight:520;background:#297ff0;'>Name</th>
				<th style='width:25%;height:8vh;font-family:Josefin;color:white;border:1px solid white;font-size:20px;font-weight:520;background:#297ff0;'>Designation</th>
				<th style='width:25%;height:8vh;font-family:Josefin;color:white;border:1px solid white;font-size:20px;font-weight:520;background:#297ff0;'>Phone Number</th>
				<th style='width:25%;height:8vh;font-family:Josefin;color:white;border:1px solid white;font-size:20px;font-weight:520;background:#297ff0;'>Email ID</th>
			</tr>

			
		`;
		await db.collection('admins').get().then(async (r)=> {
			await r.docs.map(async(g) => {
				let extract_UID=await auth.currentUser.email.split('@')[0].split('.')[1]
				if (g.id.split('.')[2].includes(extract_UID)){
					office_bearer_tbl.innerHTML+=`
						<tr>
							<td style='width:25%;font-family:Josefin;border:1px solid black;font-weight:520;height:10vh;'><center>`+g.data().name+`</center></td>
							<td style='width:25%;font-family:Josefin;border:1px solid black;font-weight:520;height:10vh;'><center>`+g.data().designation+`</center></td>
							<td style='width:25%;font-family:Josefin;border:1px solid black;font-weight:520;height:10vh;'><center><acronym title='Click to Copy' class='tocopy'>`+g.data().phno+`</acronym></center></td>
							<td style='width:25%;font-family:Josefin;border:1px solid black;font-weight:520;height:10vh;'><center><acronym title='Click to Copy' class='tocopy'>`+g.data().mailid+`</acronym></center></td>
						</tr>
					`
				}

			})
		})
		document.getElementById('widg_cont').appendChild(office_bearer_tbl)
		let copier=document.querySelectorAll('.tocopy')
		for (let element of copier){
			element.onclick=function(){
				navigator.clipboard.writeText(element.innerHTML)
				alert("Text copied")
			}
		}
	}
	scroll_on_hover(document.getElementById('dash_div'))
	document.getElementById('visit_approve').onclick=function(){
		document.getElementById('widg_cont').appendChild(document.createElement('br'))
		var view_approve_div=document.createElement('div')
		view_approve_div.style='margin:auto;width:70vw;height:80vh;border-radius:8px;border:2px solid black;background:whitesmoke;'
		view_approve_div.innerHTML=`
			<center><h2>Visitor Pre - Approval</h2></center>
			<br>
			<div style='width:100%;height:100%;display:flex;justify-content:space-evenly;'>
				<div>
					<div class='inputbox' style='width:30vw;margin-left:50px;'>
						<input required id='name'>
						<label>Name of Visitor</label>
					</div>
					<br>
					<textarea style='margin-left:50px;width:30vw;height:25vh;resize:none;' placeholder='Description of Visitor (Optional)'></textarea>
					<br><br>
					<div class='inputbox' style='width:30vw;margin-left:50px;'>
						<input required id='name'>
						<label>Date of Visit</label>
					</div>
					<br><br>
					<div class='inputbox' style='width:30vw;margin-left:50px;'>
						<input required id='name'>
						<label>Expected Time of Visit</label>
					</div>
				</div>
				<div>
					<center><button id='visitor_photo' style='border-radius:8px;border:2px dashed black;height:20vh;width:10vw;font-family:Josefin;'>Attach Photograph <br>of Visitor (Optional)</button></center>
				</div>
			</div>

			
		`;
		document.getElementById('widg_cont').appendChild(view_approve_div)
		document.getElementById('visitor_photo').onclick=async function(){
			
			let file_fetcher=document.createElement('input')
			file_fetcher.type='file'
			
			file_fetcher.onchange=async function(e){
				console.log(e.target.files[0])
				await storage.ref().child('hi').put(e.target.files[0])

				
			}
			file_fetcher.click()
			
		}
	}





})();


let app_passwd="qcwf frfq relo txbj"