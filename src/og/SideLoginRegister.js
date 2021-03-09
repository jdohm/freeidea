'use strict';

function sendLogin() {
            if(!document.forms.login_form.email.checkValidity()) {
                document.getElementById("error_mail").innerHTML = "Can&#39t be empty";
                document.getElementById("email").style.background = "#ff6666";
                return false;
            }
            if(!document.forms.login_form.password.checkValidity()) {
                document.getElementById("error_password").innerHTML = "Can&#39t be empty";
                document.getElementById("password").style.background = "#ff6666";
                return false;
            }
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var obj = JSON.parse(this.responseText);
                    if(obj.hasOwnProperty("message")) {
                        document.getElementById("error_server").innerHTML = obj.message;
                        //alert(obj.message);
                    }
                    else {
                        //alert("welcome " + obj + "!");
                        myLogin(obj);
                        SidePanel.hide();
                    }
                }};
            xhttp.open("POST", "submitLogin", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("email="+document.getElementById("email").value+"&password="+document.getElementById("password").value);
};
export { sendLogin };

function showLogin() {
        var html =
            `
<div style="overflow-y: auto;flex-grow: 1;">
    <form method="POST" action="submitLogin" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank" name="login_form">
    <fieldset>
        <legend>Login</legend>
        <label for="email">E-mail address or username:</label><br>
        <input id="email" name="email" placeholder="example@provider.com" required>
        <span id="error_mail"></span><br>
        <br>
        <label for="password" required>Password:</label><br>
        <input type="password" id="password" name="password">
        <span id="error_password"></span><br><br>
        <div id="error_server"></div>
        <br><br>
        <input type="button" class="oi-overlay-button" onclick='SideLoginRegister.sendLogin()' value="Login"/>
    </fieldset>
    </form>
</div>
<div style="flex-grow: 0;">
    <input type="button" onclick="SidePanel.hide()" id="close-btn" class="oi-side-button" type="button" value="Back"/>
</div>
    `;
    SidePanel.show(html);
    document.getElementById("password").addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            SideLoginRegister.sendLogin();
        }
    });
};
export { showLogin };


function sendRegister() {
                if(!document.forms.register_form.email.checkValidity()) {
                    document.getElementById("error_mail").innerHTML = "Can&#39t be empty";
                    document.getElementById("email").style.background = "#ff6666";
                    return false;
                }
                if(!document.forms.register_form.name.checkValidity()) {
                    document.getElementById("error_name").innerHTML = "Can&#39t be empty";
                    document.getElementById("name").style.background = "#ff6666";
                    return false;
                }
                if(!document.forms.register_form.password.checkValidity()) {
                    document.getElementById("error_password").innerHTML = "Can&#39t be empty, min length=8";
                    document.getElementById("password").style.background = "#ff6666";
                    return false;
                }
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        SidePanel.hide();
                    }};
                xhttp.open("POST", "submitRegister", true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("name="+document.getElementById("name").value+"&email="+document.getElementById("email").value+"&password="+document.getElementById("password").value);
};
export { sendRegister };


function showRegister() {
        var html =
    `
<div style="overflow-y: auto;flex-grow: 1;">
    <form method="POST" action="submitRegister" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank" name="register_form">
        <fieldset>
            <legend>Register</legend>
            <label for="email">E-mail address:</label><br>
            <input type="email" id="email" name="email" placeholder="example@provider.com" required>
            <span id="error_mail"></span><br>
            <label for="name">Username:</label><br>
            <input type="text" id="name" name="name" placeholder="Fred Feuerstein" required>
            <span id="error_name"></span><br>
            <label for="password">Password:</label><br>
            <input type="password" title="min length: 8" id="password" name="password" placeholder="************" pattern=".{8,}" required>
            <span id="error_password"></span><br><br>
            <input type="button" class="oi-overlay-button" onclick='SideLoginRegister.sendRegister();' value="Register"/>
        </fieldset>
		</form>
</div>
<div style="flex-grow: 0;">
    <input type="button" onclick="SidePanel.hide()" id="close-btn" class="oi-side-button" value="Back"/> </div>
</div>
    `;
    SidePanel.show(html);
    document.getElementById("password").addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            SideLoginRegister.sendRegister();
        }
    });

};

export { showRegister };
