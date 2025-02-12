document.addEventListener("DOMContentLoaded", function (){
    const tableBody = document.getElementById("fieldsTable");
    const fieldNameInput = document.getElementById("fieldName");
    const fieldValueInput = document.getElementById("fieldValue");
    const addFieldBtn = document.getElementById("addField");
    let saveTimeout;

    chrome.storage.local.get("jobFields", (data)=> {
        if (data.jobFields){
            data.jobFields.forEach(addToTable)
        }
    });

    addFieldBtn.addEventListener("click", ()=>{
        const name = fieldNameInput.value.trim();
        const value = fieldValueInput.value.trim();
        if(!name || !value) return;

        addToTable({name, value});
        saveFieldDebounced();

        fieldNameInput.value = "";
        fieldValueInput.value = "";
    });

    function addToTable({name, value}){
        const row = document.createElement("tr");
        row.innerHTML = `
            <td contenteditable="true" class="editable">${name}</td>
            <td contenteditable="true" class="editable">${value}</td>
            <td><button class="copyBtn">Copy</button></td>
        `


        row.querySelector(".copyBtn").addEventListener("click", ()=>{
            navigator.clipboard.writeText(value).then(() => {
                showNotification("Copied: " + value, "success");
            }).catch(err => {
                console.error("Could not copy text: ", err);
                showNotification("Could not copy text: " + err, "error");
            })
        });

        row.querySelectorAll(".editable").forEach(cell =>{
            cell.addEventListener("input", saveFieldDebounced);
        });

        tableBody.appendChild(row);
    }

    function showNotification(message, type= "success"){
        let notification = document.createElement("div");
        notification.innerText = message
        notification.className = `notification ${type}`;
        document.body.appendChild(notification);

        setTimeout(()=> {
            notification.remove();
        }, 3000);
    }

    function saveFieldDebounced(){
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveFields, 2000);
    }

    function saveFields(){
        const rows = document.querySelectorAll("#fieldsTable tr")
        const fields = Array.from(rows).map(row => {
            const cells = row.querySelectorAll("td");
            return {name: cells[0].innerText.trim(), value: cells[1].innerText.trim()};
        })

        chrome.storage.local.set({ jobFields : fields}, ()=> {
            console.log("Saved fields");
        })
    }

    document.getElementById("clearAll").addEventListener("click", function () {
        if (confirm("Are you sure you want to clear all saved fields? This action cannot be undone.")) {
            chrome.storage.local.remove("autoFillFields", () => {
                console.log("All fields cleared.");
                document.getElementById("fieldsTable").innerHTML = ""; // Clear UI table
            });
        }
    });


})