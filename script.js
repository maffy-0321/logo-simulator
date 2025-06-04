document.addEventListener('DOMContentLoaded', () => {
    // ロゴシミュレーターのチェックボックスグループのセレクタ
    const planSelectCheckboxes = document.querySelectorAll('input[name="planSelect"]');
    const logoGuideSelectCheckboxes = document.querySelectorAll('input[name="logoGuideSelect"]');
    const optionSelectCheckboxes = document.querySelectorAll('input[name="optionSelect"]');

    const totalPriceElement = document.getElementById('totalPrice');
    const exportPdfButton = document.getElementById('exportPdfButton');
    
    // ロゴシミュレーターのトグル要素を取得
    const toggleHeaders = document.querySelectorAll('.toggle-header');

    // ★★★ 排他選択を制御する関数（変更なし） ★★★
    function handleExclusiveCheckboxSelection(event, groupName) {
        const clickedCheckbox = event.target;
        const checkboxesInGroup = document.querySelectorAll(`input[name="${groupName}"]`);

        // ロゴシミュレーターでは、logoGuideSelectは「none」がデフォルトで、両方チェックを外せることは想定しない
        // planSelectも常に1つは選択
        const allowNoneSelected = false; // ロゴシミュレーターでは、常にどちらか1つは選択されている状態を維持

        if (!clickedCheckbox.checked) {
            const currentlyChecked = Array.from(checkboxesInGroup).filter(cb => cb.checked);
            if (!allowNoneSelected && currentlyChecked.length === 0) {
                clickedCheckbox.checked = true;
            }
        }

        checkboxesInGroup.forEach(checkbox => {
            if (checkbox !== clickedCheckbox) {
                checkbox.checked = false;
            }
        });
        
        if (!allowNoneSelected && !clickedCheckbox.checked) {
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

    // ★★★ イベントリスナーの設定 ★★★

    // 1. 基本料金 (planSelect) (排他選択)
    planSelectCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            handleExclusiveCheckboxSelection(event, 'planSelect');
        });
    });

    // 2. ロゴガイドライン選択 (logoGuideSelect) (排他選択)
    logoGuideSelectCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            handleExclusiveCheckboxSelection(event, 'logoGuideSelect');
        });
    });

    // 3. オプション（任意） (通常のチェックボックス)
    optionSelectCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateAndDisplayTotal);
    });

    // ★★★ トグル機能のイベントリスナー（変更なし） ★★★
    toggleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const toggleContent = header.nextElementSibling;
            if (toggleContent && toggleContent.classList.contains('toggle-content')) {
                if (toggleContent.style.display === 'block') {
                    toggleContent.style.display = 'none';
                    header.classList.remove('active');
                } else {
                    toggleContent.style.display = 'block';
                    header.classList.add('active');
                }
            }
        });
    });

    // ★★★ PDF出力ボタンのイベントリスナー（ファイル名のみ変更） ★★★
    exportPdfButton.addEventListener('click', () => {
        toggleHeaders.forEach(header => {
            header.classList.add('active');
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
            // ロゴシミュレーター用のファイル名に変更
            const fileName = `logo_estimate_${year}${month}${day}_${hours}${minutes}.pdf`; 

            pdf.save(fileName);
        });
    });

    // ★★★ ページロード時の初期設定 ★★★
    function initializeExclusiveSelection(checkboxesInGroup, defaultValue = null) {
        let isAnyChecked = false;
        checkboxesInGroup.forEach(checkbox => {
            if (checkbox.checked) {
                isAnyChecked = true;
            } else {
                checkbox.checked = false;
            }
        });

        if (!isAnyChecked && defaultValue !== null) {
            const defaultCheckbox = document.querySelector(`input[name="${checkboxesInGroup[0].name}"][value="${defaultValue}"]`);
            if (defaultCheckbox) {
                defaultCheckbox.checked = true;
            }
        }
    }

    // 各グループの初期選択を適用
    initializeExclusiveSelection(planSelectCheckboxes, 'light'); // 基本料金のデフォルトはライトプラン
    initializeExclusiveSelection(logoGuideSelectCheckboxes, 'none'); // ロゴガイドラインのデフォルトは不要
    
    // オプションは初期状態では選択しない
    optionSelectCheckboxes.forEach(checkbox => checkbox.checked = false);

    calculateAndDisplayTotal();
});