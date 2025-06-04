document.addEventListener('DOMContentLoaded', () => {
    // ロゴシミュレーターのチェックボックスグループのセレクタ
    const planSelectCheckboxes = document.querySelectorAll('input[name="planSelect"]');
    const logoGuideSelectCheckboxes = document.querySelectorAll('input[name="logoGuideSelect"]');
    const optionSelectCheckboxes = document.querySelectorAll('input[name="optionSelect"]');

    const totalPriceElement = document.getElementById('totalPrice');
    const exportPdfButton = document.getElementById('exportPdfButton');

    // ロゴシミュレーターのトグル要素を取得
    const toggleHeaders = document.querySelectorAll('.toggle-header');

    // ★★★ アラートダイアログをJavaScriptで生成する関数 ★★★
    function createAlertDialog() {
        const overlay = document.createElement('div');
        overlay.id = 'pdfAlertDialog';
        overlay.classList.add('alert-overlay');
        overlay.style.display = 'none'; // 初期状態では非表示

        const dialog = document.createElement('div');
        dialog.classList.add('alert-dialog');

        const header = document.createElement('div');
        header.classList.add('alert-header');
        const icon = document.createElement('span');
        icon.classList.add('alert-icon');
        const headerText = document.createElement('p');
        headerText.textContent = 'maffy-0321.github.io の内容';
        header.appendChild(icon);
        header.appendChild(headerText);

        const body = document.createElement('div');
        body.classList.add('alert-body');
        const bodyText = document.createElement('p');
        bodyText.textContent = 'PDFの出力はPCから行っています。スマートフォンからの出力は表示が崩れる可能性が高いため、推奨しません。';
        body.appendChild(bodyText);

        const footer = document.createElement('div');
        footer.classList.add('alert-footer');
        const okButton = document.createElement('button');
        okButton.id = 'alertOkButton';
        okButton.textContent = 'OK';
        footer.appendChild(okButton);

        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);

        document.body.appendChild(overlay);

        return { overlay, okButton };
    }

    // アラートダイアログの生成と要素の取得
    const { overlay: pdfAlertDialog, okButton: alertOkButton } = createAlertDialog();


    // ★★★ 排他選択を制御する関数（変更なし） ★★★
    function handleExclusiveCheckboxSelection(event, groupName) {
        const clickedCheckbox = event.target;
        const checkboxesInGroup = document.querySelectorAll(`input[name="${groupName}"]`);

        const allowNoneSelected = false;

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

    // ★★★ PDF出力ボタンのイベントリスナー（アラート機能を追加） ★★★
    exportPdfButton.addEventListener('click', () => {
        // 画面幅が880px以下の場合にアラートを表示
        if (window.innerWidth <= 880) { // スマートフォンと判断する閾値（style.cssの@media (max-width: 880px)と合わせる）
            pdfAlertDialog.style.display = 'flex'; // アラートを表示
            return; // PDF生成処理を中断
        }

        // 以下、PCからの出力時のPDF生成処理
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

    // アラートダイアログのOKボタンクリック時のイベントリスナー
    alertOkButton.addEventListener('click', () => {
        pdfAlertDialog.style.display = 'none'; // アラートを非表示
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