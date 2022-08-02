function zohoInvoke(){
    ZOHO.embeddedApp.on("PageLoad",async function(data){
       let id = data.EntityId, module = data.Entity;
       try{
         let recordResponse=await ZOHO.CRM.API.getRecord({Entity: module,RecordID: id});
         let email=recordResponse?.data[0]?.Email;
         let connectionName="zendesk";
         // let ticketUrl = "https://testingdragon.zendesk.com/api/v2/users/" + user.getJSON("id") + "/tickets/requested";
         if(!email) throw "Couldn't Get Contact Email";
         let reqZenUser={
           headers:{
             "Accept": "application/json",
             "Content-Type":"application/json"
           },
           method:"GET",
           url: "https://testingdragon.zendesk.com/api/v2/users/search.json?query=" + email,
         };
         let zenUserResp=await ZOHO.CRM.CONNECTION.invoke(connectionName,reqZenUser);
   
         let zenUserId=zenUserResp?.details?.statusMessage?.users[0]?.id;
         if(!zenUserId) throw "Contact Not Added in ZenDesk";
         let reqTicket={
           ...reqZenUser,
           url: "https://testingdragon.zendesk.com/api/v2/users/" + zenUserId + "/tickets/requested"
         }
         let ticketResp=await ZOHO.CRM.CONNECTION.invoke(connectionName,reqTicket);
         let tickets=ticketResp?.details?.statusMessage.tickets;
         if(!tickets || !Array.isArray(tickets)) throw "Coudn't Receive Tickets";

         let tbody=document.querySelector("tbody");

         if(tickets.length==0){
            tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;"><h6>No Tickets Found</h6><td></tr>`;
            return;
         }

         tbody.innerHTML=tickets.map(ticket=>{
            return `<tr><td>${ticket.subject}</td><td>${ticket.description}</td><td>${ticket.type}</td><td>${ticket.priority}</td><td>${ticket.status}</td></tr>`;
         }).join('');
        
       }catch(err){
         document.write(`<h1>${err.message || err}</h1>`);
       }
     });
    ZOHO.embeddedApp.init();
 }