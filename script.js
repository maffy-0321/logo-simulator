document.addEventListener('DOMContentLoaded', () => {
    const planSelectCheckboxes = document.querySelectorAll('input[name="planSelect"]');
    const logoGuideSelectCheckboxes = document.querySelectorAll('input[name="logoGuideSelect"]');
    const optionSelectCheckboxes = document.querySelectorAll('input[name="optionSelect"]');
    const totalPriceElement = document.getElementById('totalPrice');
    const exportPdfButton = document.getElementById('exportPdfButton');

    // ★★★ トグル機能の要素を取得 ★★★
    const toggleHeaders = document.querySelectorAll('.toggle-header');

    // ★★★ 排他選択を制御する関数（変更なし） ★★★
    function handleExclusiveCheckboxSelection(event, groupName) {
        const clickedCheckbox = event.target;
        const checkboxesInGroup = document.querySelectorAll(`input[name="${groupName}"]`);

        if (!clickedCheckbox.checked) {
            const currentlyChecked = Array.from(checkboxesInGroup).filter(cb => cb.checked);
            if (currentlyChecked.length === 0) {
                clickedCheckbox.checked = true;
            }
        }

        checkboxesInGroup.forEach(checkbox => {
            if (checkbox !== clickedCheckbox) {
                checkbox.checked = false;
            }
        });
        
        if (!clickedCheckbox.checked) {
            clickedCheckbox.checked = true;
        }

        calculateAndDisplayTotal();
    }

    // ★★★ 合計金額を計算して表示する関数（変更なし） ★★★
    function calculateAndDisplayTotal() {
        let currentTotal = 0;

        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.checked) {
                const price = parseInt(checkbox.dataset.price, 10);
                if (!isNaN(price)) {
                    currentTotal += price;
                }
            }
        });

        totalPriceElement.textContent = currentTotal.toLocaleString();
    }

    // ★★★ トグル機能のイベントリスナーを追加 ★★★
    toggleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const toggleContent = header.nextElementSibling; // ヘッダーの次の要素がコンテンツ
            if (toggleContent && toggleContent.classList.contains('toggle-content')) {
                // displayプロパティを切り替える
                if (toggleContent.style.display === 'block') {
                    toggleContent.style.display = 'none';
                    header.classList.remove('active'); // アイコン回転用クラス
                } else {
                    toggleContent.style.display = 'block';
                    header.classList.add('active'); // アイコン回転用クラス
                }
            }
        });
    });

    // ★★★ PDF出力ボタンのイベントリスナー（変更なし） ★★★
    exportPdfButton.addEventListener('click', () => {
        // PDF出力前に、一時的に全てのトグルを開く
        toggleHeaders.forEach(header => {
            header.classList.add('active'); // CSSで回転させるため
            const toggleContent = header.nextElementSibling;
            if (toggleContent && toggleContent.classList.contains('toggle-content')) {
                toggleContent.style.display = 'block';
            }
        });

        const input = document.getElementById('printableArea');

        html2canvas(input, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const fileName = `estimate_${year}${month}${day}_${hours}${minutes}.pdf`;

            pdf.save(fileName);

            // PDF出力後、トグルを元の状態に戻す（必要であれば）
            // ただし、@media printでdisplay: block !important;を設定しているため、
            // 画面表示は影響を受けません。ここでは特に戻す処理は不要です。
            // むしろ、PDF出力時の見た目をCSSで制御する方が綺麗です。
        });
    });

    // ★★★ ページロード時の初期設定（変更なし） ★★★
    function initializeExclusiveSelection(checkboxesInGroup, defaultValue) {
        let isAnyChecked = false;
        checkboxesInGroup.forEach(checkbox => {
            if (checkbox.checked) {
                isAnyChecked = true;
            } else {
                checkbox.checked = false;
            }
        });

        if (!isAnyChecked) {
            const defaultCheckbox = document.querySelector(`input[name="${checkboxesInGroup[0].name}"][value="${defaultValue}"]`);
            if (defaultCheckbox) {
                defaultCheckbox.checked = true;
            }
        }
    }

    initializeExclusiveSelection(planSelectCheckboxes, 'light');
    initializeExclusiveSelection(logoGuideSelectCheckboxes, 'none');
    
    calculateAndDisplayTotal();
});