var container, input, submit;

function failed(){
    container.style="animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;"
    setTimeout(()=>{container.style="animation: none;"},400)
}

function succeeded(uid){ // rgb(10, 73, 48)
    input.style = "background-color: rgb(10, 73, 48); text-decoration: underline;"
    setTimeout(()=>{input.style = "";},5000)
    input.value = window.location+uid
}

window.onload = function(){
    container = document.getElementsByClassName("row")[0]
    input = document.getElementById("input")
    submit = document.getElementById("submit")
    submit.onclick = () => {
        fetch("/shorten", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"url":input.value})
        }).then (res => {
            if (res.status == 200){
                return res.json()
            } else {
                failed();
            }
        }).then (data => {
            if (data != null && data.uid != null) succeeded(data.uid);
        })
    };
}