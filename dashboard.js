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
	document.getElementById('visit_approve').onclick=async function(){
		await auth.signInWithEmailAndPassword('vishwaa19_19-2c.333626@neigbhonet.com','Webdev@27')
		let pre_approve_dets={photo_prev:'',name:'',desc:'',dov:'',tov:''}
		document.getElementById('widg_cont').appendChild(document.createElement('br'))
		let view_approve_div=document.createElement('div')
		view_approve_div.style='margin:auto;width:70vw;border-radius:8px;border:2px solid black;background:whitesmoke;'
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
					<textarea id='desc' style='margin-left:50px;width:30vw;height:25vh;resize:none;border-radius:5px;' placeholder='Description of Visitor (Optional)'></textarea>
					<br><br>
					<div class='inputbox' style='width:30vw;margin-left:50px;'>
						<input onfocus='(this.type="date")' onfocusout='(this.type="text")' required id='dov'>
						<label>Date of Visit</label>
					</div>
					<br><br>
					<div class='inputbox' style='width:30vw;margin-left:50px;'>
						<input onfocus='(this.type="time")' onfocusout='(this.type="text")' required id='tov'>
						<label>Expected Time of Visit (24-hr format)</label>
					</div>
				</div>
				<div>
					<center><div id='photo_prev' style='width:10vw;height:20vh;border:2px dashed black;background:whitesmoke;border-radius:8px;'>
						<span style='font-family:Josefin;position:relative;top:40%;border-radius:8px;'>Attach Photograph <br>of Visitor (Optional)</span>
					</div></center>
					<br><br>
					<center><button id='visitor_photo' style='font-family:Josefin;border-radius:8px;border-width:0.2px;height:5vh;'>Upload Picture</button></center>
				</div>
			</div>
			<br><br>
			<center><button id='updets'>Upload Details</button></center>
			<br><br>


			
		`;
		document.getElementById('widg_cont').appendChild(view_approve_div)
		document.getElementById('updets').onclick=async function(){
			let mandate=["name",'dov','tov']
			let manc=0;
			for (let mans of mandate){
				if (document.getElementById(mans).value.trim().length==0){
					alert('All fields are mandatory')
					document.getElementById(mans).style.border='1px solid red'
					break;
				}
				else{
					document.getElementById(mans).style.border='1px solid black'
					pre_approve_dets[mans]=document.getElementById(mans).value.trim()
					manc++;
				}
			}
			pre_approve_dets.desc=document.getElementById('desc').value.trim();

			let requester={}
			await db.collection('residents').doc(await auth.currentUser.email).get().then(async (r)=>{
				let received_data=await r.data()
				for (let keys in received_data){
					if (keys!='add' && keys!='mailid'){
						requester[keys]=received_data[keys]
					}
				}
			})
			let docid;
			await db.collection('vp_approval').add({await:true}).then(async(g)=>{
				docid=await g.id
			})
			let visitor_photo='';
			if (pre_approve_dets.photo_prev!=''){
				await storage.ref().child(docid).put(pre_approve_dets.photo_prev).then(async(r)=>{
					visitor_photo=await r.task.snapshot.ref.getDownloadURL()
				})
			}
			
			let vp_approval_data={
				req_uid:await auth.currentUser.email,
				req_name:requester.name,
				req_floor:requester.floor,
				req_block:requester.block,
				req_dno:requester.d_no,
				visitor_name:pre_approve_dets.name,
				visitor_desc:pre_approve_dets.desc,
				visitor_photo:visitor_photo,
				dov:pre_approve_dets.dov,
				tov:pre_approve_dets.tov


			}
			console.log(vp_approval_data)
			await db.collection('vp_approval').doc(docid).set(vp_approval_data).then(()=>{
				console.log('hi')
			})
			// await db.collection('vp_approval').doc().set({
			// 	req_uid:await auth.currentUser.email,
			// 	req_name:requester.name

			// })
			// if (manc+optc===mandate.length+optional.length){

				

			// }
		}
		document.getElementById('visitor_photo').onclick=async function(){
			
			let file_fetcher=document.createElement('input')
			file_fetcher.type='file'
			
			file_fetcher.onchange=async function(e){
				pre_approve_dets.photo=true
				e.preventDefault()
				document.getElementById('photo_prev').innerHTML=`<img id='photo_img' src='Images/`+e.target.files[0].name+`' style='width:100%;height:100%;'>`
				pre_approve_dets.photo_prev=e.target.files[0]
				// await storage.ref().child('checking').put(e.target.files[0]).then(async(r)=>{
				// 	console.log(await r.task.snapshot.ref.getDownloadURL())
				// })
				
			}
			file_fetcher.click()
			
		}
	}





})();


let app_passwd="qcwf frfq relo txbj"