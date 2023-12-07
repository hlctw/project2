//老師建議監聽都在外層，innerHTML在內層，比較不會因為innerHTML導致之前綁定監聽消失須重設

const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCartList");

let productData = [];
let cartData = [];
function init() {
  getProductList();
  getCartList();
}
init();
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (res) {
      productData = res.data.products;
      renderProductList();
    });
}
function combineProductHTMLItem(item) {
  return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${item.images}"
      alt=""
    />
    <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
    </li>`;
}
function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductHTMLItem(item);
  });
  productList.innerHTML = str;
}

//篩選功能
productSelect.addEventListener("change", function (e) {
  const category = e.target.value;
  if (category == "全部") {
    renderProductList();
    return;
  }
  let str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += combineProductHTMLItem(item);
    }
  });
  productList.innerHTML = str;
});

//加入購物車效果
productList.addEventListener("click", function (e) {
  //點完購物車btn頁面不會跳到最上面
  e.preventDefault();
  //點選地方如不等於js-addCart的值(id)，就會return
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "js-addCart") {
    return;
  }
  let productId = e.target.getAttribute("data-id");
  //console.log(productId);
  //點選購物車比對ID，之後點選購物車一次num要加1
  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        //從API複製data陣列回來，並且把原本productId的值改成productId
        data: {
          productId: productId,
          quantity: numCheck,
        },
      }
    )
    .then(function (res) {
      alert("加入購物車");
      getCartList();
    });
});

//取得購物車列表
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (res) {
      //console.log(response.data.finalTotal);
      document.querySelector(".js-total").textContent = res.data.finalTotal;
      cartData = res.data.carts;
      let str = "";
      cartData.forEach(function (item) {
        str += `<tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="" />
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>NT$${item.product.price}</td>
        <td>${item.quantity}</td>
        <td>NT$${item.product.price * item.quantity}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}"> clear </a>
        </td>
      </tr>`;
      });
      cartList.innerHTML = str;
    });
}

cartList.addEventListener("click", function (e) {
  e.preventDefault();
  //console.log(e.target);
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    alert("點錯了");
    return;
  }
  //console.log(cartId);
  //購物車全部刪除
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then(function (res) {
      alert("刪除單筆購物車成功");
      getCartList();
    });
});

//一鍵刪除全部購物
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (res) {
      alert("刪除全部購物車");
      getCartList();
    })
    .catch(function (res) {
      alert("購物車已清空，請勿重複點擊");
    });
});

//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  //console.log("有點到");
  if (cartData.length == 0) {
    alert("請加入購物車");
    return;
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == "" ||
    tradeWay == ""
  ) {
    alert("請輸入訂單資料");
    return;
  }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay,
          },
        },
      }
    )
    .then(function (res) {
      alert("訂單建立成功");
      document.querySelector("#customerName").value = "";
      document.querySelector("#customerPhone").value = "";
      document.querySelector("#customerEmail").value = "";
      document.querySelector("#customerAddress").value = "";
      document.querySelector("#tradeWay").value = "ATM";
      getCartList();
    });
});
