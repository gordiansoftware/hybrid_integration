(async function() {
  let d = new Date();
  d.setDate(d.getDate() + 1); // Add one day to the current date.
  const formattedStringDate = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  const BASE_URL = "https://test.gordiansoftware.com/v1.3";
  const FLIGHT_STRING = `JFK*${formattedStringDate}T18:55*CQ*777*FRA*${formattedStringDate}T07:35`;
  const CACHE_URL =
    `${BASE_URL}/funnel/cache?agent_id=demo&adults=1&flight_string=${FLIGHT_STRING}` +
    '&fare_basis=YABDSC123&fare_classes=Y&fare_families=Economy,Economy';

  const response = await fetch(CACHE_URL);
  const { session_id } = await response.json();

  const container = document.createElement("div");
  document.body.append(container);

  const gordianResponse = products => {
    for (let p in products) {
      const product = products[p];
      const { currency, price, unique_id } = product;
      console.log(currency, price, unique_id);
    }
    let productsString = JSON.stringify(products, null, 2);
    document.getElementById("result").innerText =
      "// once the seats are selected, then gordianResponse is called...\n" +
      `gordianResponse(${productsString})`;
  };

  let polls = 0;

  const onLoad = () => {
    if (window.GordianDisplay) {
      window.GordianDisplay.init({
        gordianResponse: gordianResponse
      }).then(() => {
        window.GordianDisplay.showSeatMap({
          passengers: {
            adults: [{ first_names: "Vincent", surname: "Van Gogh" }]
          },
          container: container, // where to render the seatmap
          modal: true // show the seatmap in a pop-up
        });
      });
    }
  };

  window.gordianError = error => {
    if (error.status_code === 202) {
      // poll again
      if (polls < 30) {
        setTimeout(() => {
          console.log("polling...");
          var script = document.createElement("script");
          script.src = `${BASE_URL}/funnel/display.js?agent_id=demo&session_id=${session_id}&_poll=${polls}`;
          script.setAttribute("crossorigin", "anonymous");
          script.addEventListener("load", onLoad);
          document.body.appendChild(script);
        }, 1000);
        polls += 1;
        return;
      }
    }
    // some other error has occured - proceed without Gordian
    console.log(`error ${error.status_code}`);
  };

  var script = document.createElement("script");
  script.src = `${BASE_URL}/funnel/display.js?agent_id=demo&session_id=${session_id}`;
  script.setAttribute("crossorigin", "anonymous");
  script.addEventListener("load", onLoad);
  document.body.appendChild(script);
})();
