'use strict';

function showLogin() {
        var html =
            `<form method="POST" action="submitLogin" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank" name="login_form">

  <fieldset>
    <legend>Login</legend>
    <label for="email">E-mail address:</label><br>
    <input type="email" id="email" name="email" placeholder="example@provider.com" required>
    <span id="error_mail"></span><br>
    <br>
    <label for="password" required>Password:</label><br>
    <input type="password" id="password" name="password">
    <span id="error_password"></span><br><br>
    <div id="error_server"></div>
    <br><br>
    <div type="submit" class="oi-overlay-button" onclick='
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
                        document.getElementById("btnLogin").style.display = "none";
                        document.getElementById("btnRegister").style.display = "none";
                        document.getElementById("btnLogout").innerHTML = "Logout: " + obj;
                        document.getElementById("btnLogout").style.display = "inline-block";
                        SidePanel.hide();
                    }
                }};
            xhttp.open("POST", "submitLogin", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("email="+document.getElementById("email").value+"&password="+document.getElementById("password").value);
'>Login</div>
  </fieldset>
		</form>
<div onclick="SidePanel.hide()" id="close-btn" class="oi-side-button" type="button">Back</div> </div>
    `;
        SidePanel.show(html);
};

export { showLogin };

function showRegister() {
        var html =
    `<form method="POST" action="submitRegister" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank" name="register_form">

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
    <div type="submit" class="oi-overlay-button" onclick='
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
'>Register</div>
  </fieldset>
		</form>
<div onclick="SidePanel.hide()" id="close-btn" class="oi-side-button">Back</div> </div>
    `;
        SidePanel.show(html);
};

export { showRegister };
