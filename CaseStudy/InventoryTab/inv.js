window.addEventListener("DOMContentLoaded",() => {
    loadSave().catch(error => alert(error.message));
})

function loadList(item){
    const ul = document.createElement('ul');
    ul.className="EIRow";

    const dt = document.createElement('li');
    dt.textContent = item.date;

    const inm = document.createElement('li');
    inm.textContent = item.name;

    const cat = document.createElement('li');
    cat.textContent = "Purchase";

    const ID = document.createElement('li');
    ID.textContent = item.id;

    const qty = document.createElement('li');
    qty.textContent = item.quantity;

    const stts = document.createElement('li');
    if(item.quantity>=50){
        stts.textContent="High Stock";
        stts.style.backgroundColor= "lightgreen";
    } else {
        stts.textContent="Low Stock";
        stts.style.backgroundColor= "red";
    }

    const tp = document.createElement('li');
    tp.textContent = "₱"+item.price;

    ul.append(dt,inm,cat,ID,qty,stts,tp);
    
    document.querySelector(".EnteredItems").prepend(ul);
}

async function loadSave(){  
    const response = await fetch("../Backend.php");
    if (!response.ok){
        throw new Error("Could not load saved items");
    }    
    const data = await response.json();
    data.items.forEach(loadList);

    const response1 = await fetch("../Backend.php?type=sale");
    if (!response1.ok){
        throw new Error("Could not load saved items");
    }    
    const data1 = await response1.json();

    const wrnng = data.items.filter(
        item => Number(item.quantity) < 50
    ).length;

    const wrnngDis = document.createElement("h3");
    wrnngDis.textContent=wrnng;
    document.getElementById("IBNotif").append(wrnngDis);

    ex = data.items.reduce((total,item) => total + Number(item.price),0);

    const totalDisplay = document.createElement("h3");
    totalDisplay.textContent = "₱"+ex;
    document.getElementById("IBExpense").append(totalDisplay);

    totIncome = data1.sales.reduce((total,sale) => total + Number(sale.income),0);

    const incomeDisplay = document.createElement("h3");
    incomeDisplay.textContent = "₱" + totIncome;
    document.getElementById("IBIncome").append(incomeDisplay);

    totProfit = totIncome-ex;
    const profitDisplay = document.createElement("h3");
    profitDisplay.textContent = "₱" + totProfit;
    document.getElementById("IBProfit").append(profitDisplay);

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