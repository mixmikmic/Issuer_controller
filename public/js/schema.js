

var checkbox = document.getElementById("revocCheck");

checkbox.addEventListener('change', function() {
  if (this.checked) {
   document.getElementById("size").disabled = false;
  } else {
   document.getElementById("size").disabled = true;
  }
});