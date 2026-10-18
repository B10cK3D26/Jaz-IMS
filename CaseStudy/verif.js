let verificationPassword = "10172024";

function verWindow() {
    const enteredPassword = document.getElementById("vpass").value;
    if (enteredPassword === verificationPassword){
        document.getElementById("Verify").close();
    } else {
        document.getElementById("warn").textContent = "Incorrect password!";
    }
}

function changePw(){
    const old = document.getElementById("opw").value;
    const newpw = document.getElementById("npw").value;
    const vernew = document.getElementById("cnpw").value;

    if(newpw.trim()==="" || vernew.trim()==="" || old.trim()===""){
        document.getElementById("warn1").textContent = "Missing Fields!";
        return;
    }

    if(old === verificationPassword){
        if(newpw === vernew){
            verificationPassword = newpw;
            alert("Your password has been changed");
            document.getElementById("changePw").close();
            return;
        } else{
            document.getElementById("warn1").textContent = "New Password do not match";
        }
    } else{
        document.getElementById("warn1").textContent = "Incorrect Old Password!";
    }
}
