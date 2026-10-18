window.addEventListener("DOMContentLoaded",() => {
    loadSales().catch(error => alert(error.message));
})

function openRecord(){
    document.getElementById("Record").showModal();
}

function recordingCancel(){
    document.getElementById("Record").close();
}

async function recordingConfirm(){
    const transactions={
    transactionDate: document.getElementById("traDate").value,
    item: document.getElementById("itmName").value,
    customer: document.getElementById("cusName").value,
    service: document.getElementById("service").value,
    transactionId: Number(document.getElementById("traID").value),
    quantity: Number(document.getElementById("qtyUsed").value),
    income: Number(document.getElementById("income").value)
    }

    const response = await fetch("../Backend.php?type=sale", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactions)
    });

    if(!response.ok){
        throw new Error("Could not save item");
    }
    location.reload();
}

async function loadListedSales(sale) {
    const ul = document.createElement('ul');
    ul.className = "EIRow";

    const dt = document.createElement('li');
    dt.textContent=sale.transactionDate;

    const name = document.createElement('li');
    name.textContent=sale.item;

    const cust = document.createElement('li');
    cust.textContent=sale.customer;

    const serv = document.createElement('li');
    serv.textContent=sale.service;

    const id = document.createElement('li');
    id.textContent=sale.transactionId;

    const qty = document.createElement('li');
    qty.textContent=sale.quantity;

    const inc = document.createElement('li');
    inc.textContent="₱"+sale.income;

    ul.append(dt,name,cust,serv,id,qty,inc);

    document.querySelector(".EnteredItems").prepend(ul);
}

async function loadSales(){
    const response = await fetch("../Backend.php?type=sale");
    if (!response.ok){
        throw new Error("Could not load saved items");
    }    
    const data = await response.json();
    data.sales.forEach(loadListedSales);

    const response1 = await fetch("../Backend.php");
    if (!response1.ok){
        throw new Error("Could not load saved items");
    }    
    const data1 = await response1.json();

    const wrnng = data1.items.filter(
        item => Number(item.quantity) < 50
    ).length;

    const wrnngDis = document.createElement("h3");
    wrnngDis.textContent=wrnng;
    document.getElementById("IBNotif").append(wrnngDis);

    ex = data1.items.reduce((total,item) => total + Number(item.price),0);

    const totalDisplay = document.createElement("h3");
    totalDisplay.textContent = "₱"+ex;
    document.getElementById("IBExpense").append(totalDisplay);

    totIncome = data.sales.reduce((total,sale) => total + Number(sale.income),0);

    const incomeDisplay = document.createElement("h3");
    incomeDisplay.textContent = "₱" + totIncome;
    document.getElementById("IBIncome").append(incomeDisplay);

    totProfit = totIncome-ex;
    const profitDisplay = document.createElement("h3");
    profitDisplay.textContent = "₱" + totProfit;
    document.getElementById("IBProfit").append(profitDisplay);
}

function openModify(){
    document.getElementById("Modify").showModal();
}
 function modifyCancel(){
    document.getElementById("Modify").close();
}

let transactionBeingModified = null;

async function modifyConfirm(){
    const response = await fetch("../Backend.php?type=sale");
    if (!response.ok){
        throw new Error("Could not load saved items");
    }
    const data = await response.json();

    const idToFind = Number(document.getElementById("toModify").value);

    const foundItem = data.sales.find(
        sale => Number(sale.transactionId) === idToFind
    );

    if(!foundItem){
        alert("No item found with id: "+idToFind);
        return;
    }

    alert("Successfully found the item!")
    document.getElementById("Modify").close();
    toModifyFound(foundItem);
}

async function toModifyFound(sale){
    document.getElementById("modifyWindow").showModal();
    transactionBeingModified = sale;

    document.getElementById("StranName").value=sale.item;
    document.getElementById("StranCust").value=sale.customer;
    document.getElementById("StranServ").value=sale.service;
    document.getElementById("StransId").value=sale.transactionId;
    document.getElementById("StranQuan").value=sale.quantity;
    document.getElementById("StranInco").value=sale.income;
}

function modWinCancel(){
    document.getElementById("modifyWindow").close();
}

async function modWinConfirm(){
    if(!transactionBeingModified){
        alert("Lost the found item!");
        return;
    }

    const response = await fetch("../Backend.php?type=sale",{
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({
            originalTransactionId: Number(transactionBeingModified.transactionId),
            item: document.getElementById("StranName").value,
            customer: document.getElementById("StranCust").value,
            service: document.getElementById("StranServ").value,
            transactionId: Number(document.getElementById("StransId").value),
            quantity: Number(document.getElementById("StranQuan").value),
            income: Number(document.getElementById("StranInco").value)
        })
    });

    const result = await response.json();
    if(!response.ok){
        alert(result.error);
        return;
    }
    alert("Modifications to transaction ID: "+transactionBeingModified.transactionId+" have been applied");
    location.reload();
}


async function findToDelete(){
    const idToFind = Number(document.getElementById("delID").value);

    const response = await fetch("../Backend.php",{
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({id: idToFind})
    });

    const result = await response.json();

    if(!response.ok){
        alert(result.error);
        return;
    } 

    alert("Item Deleted.");
    location.reload();
}

let itemBeingEdited=null;

async function findToEdit() {
    const response = await fetch("../Backend.php");
    if (!response.ok){
        throw new Error("Could not load saved items");
    }    
    const data = await response.json();

    const idToFind = Number(document.getElementById("edID").value);

    const foundItem = data.items.find(
        item => Number(item.id) === idToFind
    );

    if(!foundItem){
        alert("No item found with id: "+idToFind);
        return;
    }
    alert("Successfully found the item!")
    document.getElementById("Editing").close();
    foundIDtoEdit(foundItem);
}

async function foundIDtoEdit(item) {
    itemBeingEdited = item;
    document.getElementById("EditorWindow").showModal();

    document.getElementById("itemName").value = item.name;
    document.getElementById("itemQuantity").value=item.quantity;
    document.getElementById("itemID").value=item.id;
    document.getElementById("itemPrice").value=item.price;
}

async function ConfirmEditing() {
    if(!itemBeingEdited){
        alert("Lost the found item!");
        return;
    }

    const response = await fetch("../Backend.php",{
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({
            originalId: Number(itemBeingEdited.id),
            name: document.getElementById("itemName").value,
            quantity: Number(document.getElementById("itemQuantity").value),
            id: Number(document.getElementById("itemID").value),
            price: Number(document.getElementById("itemPrice").value)
        })
    });

    const result = await response.json();

    if(!response.ok){
        alert(result.error);
        return;
    }

    alert("Changes to item ID: "+itemBeingEdited.id+" have been applied");
    location.reload();
}

function openEdit(){
    document.getElementById("Edit").showModal();
}
function edCancel(){
    document.getElementById("Edit").close();
}
function edConfirm(){
    document.getElementById("Edit").close();
    document.getElementById("EEdit").showModal();
}
function edDelete(){
    document.getElementById("EEdit").close();
    document.getElementById("Delete").showModal();
}
function edEdit(){
    document.getElementById("EEdit").close();
    document.getElementById("Editing").showModal();
}

function CancelD(){
    document.getElementById("Delete").close();
}
function CancelE(){
    document.getElementById("Editing").close();
}

function CancelEditing(){
    document.getElementById("EditorWindow").close();
}

function openSettings(){
    document.getElementById("SettingsWindow").showModal();
}

function setClose(){
    document.getElementById("SettingsWindow").close();
}

function opVer(){
    document.getElementById("SettingsWindow").close();
    document.getElementById("Verify").showModal();
}

function opChange(){
    document.getElementById("SettingsWindow").close();
    document.getElementById("changePw").showModal();
}

function cancelCpw(){
    document.getElementById("changePw").close();
}