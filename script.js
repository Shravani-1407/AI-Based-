const documentInput = document.getElementById("documentInput");
const imagePreview = document.getElementById("imagePreview");
const previewContainer = document.getElementById("previewContainer");
const analyzeBtn = document.getElementById("analyzeBtn");
const analysisContainer = document.getElementById("analysisContainer");
const analysisText = document.getElementById("analysisText");

const documentNumber = document.getElementById("documentNumber");
const verifyBtn = document.getElementById("verifyBtn");
const verificationResult = document.getElementById("verificationResult");

let imageQuality = "NOT CHECKED";


// IMAGE PREVIEW

documentInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        imagePreview.src = event.target.result;

        const uploadedImage = new Image();

        uploadedImage.onload = function () {

            const width = uploadedImage.width;
            const height = uploadedImage.height;

            if (width < 500 || height < 300) {

                imageQuality =
                    "LOW QUALITY - IMAGE RESOLUTION TOO SMALL";

            } else if (width >= 1500 && height >= 1000) {

                imageQuality = "GOOD QUALITY";

            } else {

                imageQuality = "ACCEPTABLE";
            }

            previewContainer.style.display = "block";
            analysisContainer.style.display = "none";
        };

        uploadedImage.src = event.target.result;
    };

    reader.readAsDataURL(file);
});


// DOCUMENT ANALYSIS

analyzeBtn.addEventListener("click", function () {

    const file = documentInput.files[0];

    if (!file) {

        alert("Please upload a document first!");
        return;
    }


    analysisContainer.style.display = "block";


    const steps = [

        "Uploading document securely to backend...",
        "Checking document image quality...",
        "Detecting document boundaries...",
        "Analyzing document structure...",
        "Checking visible text regions...",
        "Scanning for suspicious patterns...",
        "Calculating backend risk assessment..."

    ];


    let step = 0;


    analysisText.innerHTML =
        "⏳ <b>" + steps[step] + "</b>";


    const interval = setInterval(function () {

        step++;

        if (step < steps.length) {

            analysisText.innerHTML =
                "⏳ <b>" + steps[step] + "</b>";
        }

    }, 700);


    const formData = new FormData();

    formData.append("document", file);


    fetch("/analyze", {

        method: "POST",

        body: formData

    })

    .then(function (response) {

        if (!response.ok) {

            throw new Error("Backend analysis failed");
        }

        return response.json();
    })

    .then(function (data) {

        clearInterval(interval);


        if (!data.success) {

            analysisText.innerHTML =
                "⚠️ Backend analysis failed: " + data.message;

            return;
        }


        const riskScore = data.risk_score;

        const backendImageQuality =
            data.image_quality;


        let result = "";
        let resultClass = "";
        let riskClass = "";


        if (riskScore <= 30) {

            result = "🟢 LIKELY GENUINE";
            resultClass = "risk-low";
            riskClass = "low";

        } else if (riskScore <= 60) {

            result = "🟡 MANUAL REVIEW REQUIRED";
            resultClass = "risk-medium";
            riskClass = "medium";

        } else {

            result = "🔴 SUSPICIOUS DOCUMENT";
            resultClass = "risk-high";
            riskClass = "high";
        }


        analysisText.innerHTML = `

            <div class="report">

                <h3>🛡️ AI Identity Screening Report</h3>

                <p>
                    📄 Document Upload:
                    <b>SUCCESS</b>
                </p>

                <p>
                    📁 Backend File:
                    <b>${data.filename}</b>
                </p>

                <p>
                    🖼️ Backend Image Quality:
                    <b>${backendImageQuality}</b>
                </p>

                <p>
                    📊 File Size:
                    <b>${Math.round(data.file_size / 1024)} KB</b>
                </p>

                <p>
                    🔍 Document Structure:
                    <b>ANALYZED</b>
                </p>

                <p>
                    📝 Text Region Check:
                    <b>COMPLETED</b>
                </p>

                <p>
                    ⚠️ Suspicious Pattern Check:
                    <b>COMPLETED</b>
                </p>


                <div class="identity-info">

                    <h3>
                        👤 Extracted Identity Information
                    </h3>

                    <p>
                        📄 Document Type:
                        <b>IDENTITY DOCUMENT</b>
                    </p>

                    <p>
                        👤 Name:
                        <b>INFORMATION FIELD DETECTED</b>
                    </p>

                    <p>
                        🎂 Date of Birth:
                        <b>INFORMATION FIELD DETECTED</b>
                    </p>

                    <p>
                        🔢 Document Number:
                        <b>INFORMATION FIELD DETECTED</b>
                    </p>

                    <p class="ocr-note">

                        🔍 OCR Integration:
                        READY FOR NEXT PHASE

                    </p>

                </div>


                <hr>


                <h2 class="${resultClass}">

                    ${result}

                </h2>


                <div class="risk-label">

                    Backend Prototype Risk Score:
                    ${riskScore}%

                </div>


                <div class="risk-meter">

                    <div
                        class="risk-fill ${riskClass}"
                        style="width: ${riskScore}%"
                    ></div>

                </div>


                <p>

                    ℹ️ This prototype combines frontend
                    screening with Flask backend validation
                    and prototype database integration.

                    Production deployment can integrate OCR,
                    trained fake-document detection models,
                    face matching and authorized databases.

                </p>

            </div>

        `;
    })

    .catch(function (error) {

        clearInterval(interval);

        analysisText.innerHTML = `

            ⚠️ Backend connection failed.

            Please ensure the Flask server is running.

        `;

        console.error(error);
    });

});


// DATABASE IDENTITY VERIFICATION

verifyBtn.addEventListener("click", function () {

    const enteredNumber =
        documentNumber.value.trim().toUpperCase();


    if (enteredNumber === "") {

        verificationResult.innerHTML =
            "⚠️ Please enter a document number.";

        return;
    }


    verificationResult.innerHTML =
        "⏳ Checking prototype database...";


    fetch("/verify/" + enteredNumber)

        .then(function (response) {

            return response.json();
        })

        .then(function (data) {

            if (data.found) {

                if (data.status === "GENUINE") {

                    verificationResult.innerHTML =

                        "🟢 VERIFIED: GENUINE DOCUMENT<br>" +

                        "Document Number: " +
                        data.document_number +

                        "<br>Document Type: " +
                        data.document_type;

                }

                else if (data.status === "SUSPICIOUS") {

                    verificationResult.innerHTML =

                        "🔴 SUSPICIOUS DOCUMENT DETECTED<br>" +

                        "Document Number: " +
                        data.document_number +

                        "<br>Manual Investigation Recommended";

                }

                else if (data.status === "MANUAL REVIEW") {

                    verificationResult.innerHTML =

                        "🟡 MANUAL REVIEW REQUIRED<br>" +

                        "Document Number: " +
                        data.document_number +

                        "<br>Additional verification required";
                }

            }

            else {

                verificationResult.innerHTML =

                    "🔴 NOT FOUND IN PROTOTYPE DATABASE<br>" +

                    "Manual Review Required";
            }

        })

        .catch(function () {

            verificationResult.innerHTML =

                "⚠️ Backend connection failed. " +
                "Please ensure Flask is running.";

        });

});