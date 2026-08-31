function initBranchesSection() {
    const mapElement = document.getElementById("branches-map");
    const branchList = document.getElementById("branch-list");

    if (!mapElement || !branchList) return;

    /*
     * Барои илова кардани филиали нав,
     * танҳо як объекти нав ба ҳамин массив илова кунед.
     */
    const branches = [
        {
            id: "dushanbe",
            shortName: "Д",
            city: "Душанбе",
            address:
                "Сирк, гузаргоҳи 1-уми Неъмат Қарабоев, назди мактаби №51, хонаи 11/1",
            coordinates: [38.556136, 68.766826],
            zoom: 15
        },
        {
            id: "hamadoni",
            shortName: "Ҳ",
            city: "Ҳамадонӣ",
            address:
                "Кӯчаи Носири Хусрав 8А, пеши Бозори марказӣ, назди таксиҳои Чӯбек",
            coordinates: [37.655494, 69.626603],
            zoom: 14
        },
        {
            id: "bokhtar",
            shortName: "Б",
            city: "Бохтар",
            address:
                "Дар наздикии Боғи Бохтар ва Коллеҷи тиббӣ",
            coordinates: [37.833889, 68.779167],
            zoom: 14
        },
        {
            id: "khujand",
            shortName: "Х",
            city: "Хуҷанд",
            address:
                "Микроноҳияи 31, назди Прокуратура",
            coordinates: [40.2995, 69.635],
            zoom: 14
        }
    ];

    const selectedName =
        document.getElementById("selected-branch-name");

    const selectedAddress =
        document.getElementById("selected-branch-address");

    const routeLink =
        document.getElementById("branch-route-link");

    const branchCount =
        document.getElementById("branch-count");

    const branchTotal =
        document.getElementById("branch-total");

    const showAllButton =
        document.getElementById("show-all-branches");
    const branchSearch =
        document.getElementById("branch-search");

    const clearBranchSearch =
        document.getElementById("clear-branch-search");

    const getMapsUrl = (branch) => {
        const query =
            `Hamroh Cargo, ${branch.address}, ${branch.city}, Тоҷикистон`;

        return (
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(query)
        );
    };

    /* Рӯйхатро худкор месозад */
    branchList.innerHTML = branches
        .map((branch, index) => {
            const number = String(index + 1).padStart(2, "0");

            return `
            <button
                type="button"
                class="branch-list-item ${index === 0 ? "is-active" : ""
                }"
                data-branch="${branch.id}"
                aria-pressed="${index === 0}">

                <span class="branch-list-number">
                    ${number}
                </span>

                <span class="branch-list-content">
                    <span class="branch-list-city">
                        ${branch.city}
                    </span>

                    <span class="branch-list-address">
                        ${branch.address}
                    </span>

                    <span class="branch-list-action">
                        Дар харита нишон додан

                        <span class="branch-list-arrow">
                            →
                        </span>
                    </span>
                </span>
            </button>
        `;
        })
        .join("");

    if (branchCount) {
        branchCount.textContent =
            `${branches.length} филиал`;
    }

    if (branchTotal) {
        branchTotal.textContent =
            branches.length;
    }
    /* Паём барои вақте ки чизе ёфт нашуд */
    const branchEmptyState =
        document.createElement("div");

    branchEmptyState.className =
        "branch-search-empty";

    branchEmptyState.textContent =
        "Филиал ёфт нашуд";

    branchEmptyState.hidden = true;

    branchList.appendChild(
        branchEmptyState
    );

    /* Матнро барои ҷустуҷӯ омода мекунад */
    const normalizeSearchText = (text) => {
        return text
            .toLowerCase()
            .trim();
    };

    /* Филиалҳоро филтр мекунад */
    function filterBranches() {
        const query = normalizeSearchText(
            branchSearch?.value || ""
        );

        const cards = branchList.querySelectorAll(
            ".branch-list-item"
        );

        let visibleCount = 0;

        cards.forEach((card) => {
            const cardText = normalizeSearchText(
                card.textContent
            );

            const isVisible =
                query === "" ||
                cardText.includes(query);

            card.style.display =
                isVisible ? "" : "none";

            if (isVisible) {
                visibleCount++;
            }
        });

        if (branchCount) {
            branchCount.textContent =
                query === ""
                    ? `${branches.length} филиал`
                    : `${visibleCount} аз ${branches.length} филиал`;
        }

        branchEmptyState.hidden =
            visibleCount !== 0;

        if (clearBranchSearch) {
            clearBranchSearch.hidden =
                query === "";
        }
    }

    if (branchSearch) {
        branchSearch.addEventListener(
            "input",
            filterBranches
        );

        branchSearch.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Escape") {
                    branchSearch.value = "";
                    filterBranches();
                }
            }
        );
    }

    if (clearBranchSearch) {
        clearBranchSearch.addEventListener(
            "click",
            () => {
                branchSearch.value = "";
                filterBranches();
                branchSearch.focus();
            }
        );
    }

    const firstBranch = branches[0];

    selectedName.textContent =
        firstBranch.city;

    selectedAddress.textContent =
        firstBranch.address;

    routeLink.href =
        getMapsUrl(firstBranch);

    /*
     * Агар Leaflet бор нашуда бошад,
     * дар дохили харита паёми фаҳмо мебарояд.
     */
    if (typeof window.L === "undefined") {
        mapElement.innerHTML = `
            <div class="map-load-error">
                <div>
                    <strong>Харита бор нашуд</strong>
                    <p>
                        Пайвасти Leaflet ё тартиби script-ҳоро санҷед.
                    </p>
                </div>
            </div>
        `;

        console.error(
            "Leaflet ёфт нашуд. leaflet.js бояд пеш аз main.js пайваст бошад."
        );

        return;
    }

    const map = L.map(mapElement, {
        zoomControl: false,
        scrollWheelZoom: false
    });

    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    const markers = new Map();

    const branchesById = new Map(
        branches.map((branch) => [
            branch.id,
            branch
        ])
    );

    const createMarkerIcon = (
        branch,
        isActive = false
    ) => {
        return L.divIcon({
            className: "hamroh-marker",
            html: `
                <div class="branch-pin ${isActive ? "is-active" : ""
                }">
                    <span>${branch.shortName}</span>
                </div>
            `,
            iconSize: [52, 60],
            iconAnchor: [26, 56],
            popupAnchor: [0, -52]
        });
    };

    const createPopup = (branch) => {
        return `
            <div class="branch-popup">
                <strong>${branch.city}</strong>
                <p>${branch.address}</p>

                <a
                    href="${getMapsUrl(branch)}"
                    target="_blank"
                    rel="noopener noreferrer">
                    Масирро кушодан →
                </a>
            </div>
        `;
    };

    branches.forEach((branch) => {
        const marker = L.marker(
            branch.coordinates,
            {
                icon: createMarkerIcon(branch)
            }
        );

        marker
            .addTo(map)
            .bindPopup(createPopup(branch));

        marker.on("click", () => {
            selectBranch(
                branch.id,
                true,
                true,
                true
            );
        });

        markers.set(branch.id, marker);
    });

    const bounds = L.latLngBounds(
        branches.map(
            (branch) => branch.coordinates
        )
    );

    function showAllBranches() {
        map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 7
        });
    }

    function selectBranch(
        branchId,
        moveMap = true,
        openPopup = true,
        scrollCard = false
    ) {
        const selectedBranch =
            branchesById.get(branchId);

        if (!selectedBranch) return;

        const cards =
            branchList.querySelectorAll(
                ".branch-list-item"
            );

        cards.forEach((card) => {
            const isSelected =
                card.dataset.branch === branchId;

            card.classList.toggle(
                "is-active",
                isSelected
            );

            card.setAttribute(
                "aria-pressed",
                String(isSelected)
            );
        });

        branches.forEach((branch) => {
            const marker = markers.get(branch.id);

            marker.setIcon(
                createMarkerIcon(
                    branch,
                    branch.id === branchId
                )
            );
        });

        selectedName.textContent =
            selectedBranch.city;

        selectedAddress.textContent =
            selectedBranch.address;

        routeLink.href =
            getMapsUrl(selectedBranch);

        if (moveMap) {
            map.flyTo(
                selectedBranch.coordinates,
                selectedBranch.zoom,
                {
                    duration: 1.15
                }
            );
        }

        if (openPopup) {
            markers
                .get(selectedBranch.id)
                .openPopup();
        }

        if (scrollCard) {
            const activeCard =
                branchList.querySelector(
                    `[data-branch="${branchId}"]`
                );

            activeCard?.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    }

    branchList.addEventListener(
        "click",
        (event) => {
            const card = event.target.closest(
                ".branch-list-item"
            );

            if (!card) return;

            selectBranch(
                card.dataset.branch
            );
        }
    );

    showAllButton.addEventListener(
        "click",
        () => {
            map.closePopup();
            showAllBranches();
        }
    );

    showAllBranches();

    selectBranch(
        firstBranch.id,
        false,
        false
    );

    requestAnimationFrame(() => {
        map.invalidateSize();
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 300);

    window.addEventListener(
        "resize",
        () => map.invalidateSize()
    );
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initBranchesSection,
        {
            once: true
        }
    );
} else {
    initBranchesSection();
}
function initTariffsSection() {
    const tariffSection =
        document.getElementById("tariffs");

    if (!tariffSection) return;

    /*
     * Нархҳои Душанбе ҳоло null мебошанд,
     * зеро дар аксҳои Hamroh Cargo нишон дода нашудаанд.
     */
    const tariffData = {
        dushanbe: {
            name: "Душанбе",

            services: {
                auto: {
                    label: "Авто",
                    fullLabel: "Интиқоли автомобилӣ",
                    status: "ready",
                    eta: "15–25 рӯз",
                    volumePrice: 2590,
                    volumeText: null,
                    rangeLabel: "Вазни бор",

                    rates: [
                        {
                            range: "то 30 кг",
                            price: 27.5
                        },
                        {
                            range: "30–50 кг",
                            price: 26.5
                        },
                        {
                            range: "50–100 кг",
                            price: 25.5
                        },
                        {
                            range: "100–500 кг",
                            price: 22
                        },
                        {
                            range: "500–1000 кг",
                            price: 17
                        }
                    ]
                },

                air: {
                    label: "Авиа",
                    fullLabel: "Интиқоли ҳавоӣ",
                    status: "ready",
                    eta: "2–10 рӯз",
                    volumePrice: null,
                    volumeText: "Аз рӯи вазн ё ҳаҷм",
                    rangeLabel: "Навъи бор",

                    rates: [
                        {
                            range: "Бори стандартӣ",
                            price: 79
                        },
                        {
                            range: "Бори ҳаҷмдор",
                            price: 130
                        }
                    ],

                    note:
                        "Барои борҳои ҳавоӣ арзиши ниҳоӣ аз рӯи вазн ё ҳаҷм ҳисоб мешавад — кадоме бештар бошад."
                }
            }
        },

        hamadoni: {
            name: "Ҳамадонӣ",
            services: {
                auto: {
                    label: "Авто",
                    fullLabel: "Интиқоли автомобилӣ",
                    status: "ready",
                    eta: "15–25 рӯз",
                    volumePrice: 2650,
                    rates: [
                        {
                            range: "1–30 кг",
                            price: 28.5
                        },
                        {
                            range: "31–50 кг",
                            price: 27
                        },
                        {
                            range: "51–100 кг",
                            price: 26
                        },
                        {
                            range: "101–500 кг",
                            price: 23
                        },
                        {
                            range: "аз 500 кг боло",
                            price: 20
                        }
                    ]
                }
            }
        },

        bokhtar: {
            name: "Бохтар",
            services: {
                auto: {
                    label: "Авто",
                    fullLabel: "Интиқоли автомобилӣ",
                    status: "ready",
                    eta: "15–25 рӯз",
                    volumePrice: 2650,
                    rates: [
                        {
                            range: "1–30 кг",
                            price: 28.5
                        },
                        {
                            range: "31–50 кг",
                            price: 27
                        },
                        {
                            range: "51–100 кг",
                            price: 26
                        },
                        {
                            range: "101–500 кг",
                            price: 23
                        },
                        {
                            range: "аз 500 кг боло",
                            price: 20
                        }
                    ]
                }
            }
        },

        khujand: {
            name: "Хуҷанд",
            services: {
                auto: {
                    label: "Авто",
                    fullLabel: "Интиқоли автомобилӣ",
                    status: "ready",
                    eta: "15–25 рӯз",
                    volumePrice: 2590,
                    rates: [
                        {
                            range: "1–30 кг",
                            price: 28.5
                        },
                        {
                            range: "31–50 кг",
                            price: 27
                        },
                        {
                            range: "50–100 кг",
                            price: 26
                        },
                        {
                            range: "аз 100 кг боло",
                            price: 23
                        }
                    ]
                }
            }
        }
    };

    const state = {
        branch: "dushanbe",
        service: "auto"
    };

    const branchTabs =
        document.getElementById("tariff-branch-tabs");

    const serviceControl =
        document.getElementById("tariff-service-control");

    const serviceTabs =
        document.getElementById("tariff-service-tabs");

    const cardTitle =
        document.getElementById("tariff-card-title");

    const modeBadge =
        document.getElementById("tariff-mode-badge");

    const pricePanel =
        document.getElementById("tariff-price-panel");

    const summaryIcon =
        document.getElementById("tariff-summary-icon");

    const summaryTitle =
        document.getElementById("tariff-summary-title");

    const summaryMode =
        document.getElementById("tariff-summary-mode");

    const statusElement =
        document.getElementById("tariff-status");

    const etaValue =
        document.getElementById("tariff-eta-value");

    const volumeValue =
        document.getElementById("tariff-volume-value");

    const contactLink =
        document.getElementById("tariff-contact-link");

    const getIcon = (type) => {
        if (type === "air") {
            return `
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true">

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M10.5 21 13 13.5l7.5-2.5c1.8-.6
                           1.8-3.1 0-3.7L13 4.8 10.5 1
                           8.8 1.6 10 6.4 4.5 8.2 2.2
                           6.5 1 7.6l2.4 4.1L10 13.6
                           8.8 20.4 10.5 21Z">
                    </path>
                </svg>
            `;
        }

        return `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true">

                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 6h11v10H3V6Zm11 4h3l3 3v3h-6v-6Z">
                </path>

                <circle cx="7" cy="18" r="2"></circle>
                <circle cx="17" cy="18" r="2"></circle>
            </svg>
        `;
    };

    const formatPrice = (price) => {
        return Number.isInteger(price)
            ? String(price)
            : price.toFixed(1);
    };

    const getContactUrl = (branch, service) => {
        const message =
            `Салом, ман мехоҳам нархи тарифи ${service.label} ` +
            `барои филиали ${branch.name}-ро фаҳмам.`;

        return (
            "https://wa.me/992501222235?text=" +
            encodeURIComponent(message)
        );
    };

    function renderBranchTabs() {
        branchTabs.innerHTML =
            Object.entries(tariffData)
                .map(([branchId, branch]) => {
                    const serviceCount =
                        Object.keys(branch.services).length;

                    const description =
                        serviceCount > 1
                            ? "Авто + Авиа"
                            : "Авто";

                    const isSelected =
                        state.branch === branchId;

                    return `
                        <button
                            type="button"
                            role="tab"
                            class="tariff-branch-tab"
                            data-tariff-branch="${branchId}"
                            aria-selected="${isSelected}"
                            tabindex="${isSelected ? "0" : "-1"}">

                            <span>${branch.name}</span>
                            <small>${description}</small>
                        </button>
                    `;
                })
                .join("");
    }

    function renderServiceTabs(branch) {
        const services =
            Object.entries(branch.services);

        serviceControl.hidden =
            services.length === 1;

        serviceTabs.innerHTML =
            services
                .map(([serviceId, service]) => {
                    const isSelected =
                        state.service === serviceId;

                    return `
                        <button
                            type="button"
                            role="tab"
                            class="tariff-service-tab"
                            data-tariff-service="${serviceId}"
                            aria-selected="${isSelected}"
                            tabindex="${isSelected ? "0" : "-1"}">

                            ${getIcon(serviceId)}
                            <span>${service.label}</span>
                        </button>
                    `;
                })
                .join("");
    }

    function renderPricePanel(branch, service) {
        const contactUrl =
            getContactUrl(branch, service);

        if (
            service.status !== "ready" ||
            service.rates.length === 0
        ) {
            pricePanel.innerHTML = `
                <div class="tariff-update-state">
                    <div>
                        <div class="tariff-update-icon">
                            ${service.label === "Авиа" ? "✈" : "↻"}
                        </div>

                        <h4>Нархҳо дар ҳоли навсозӣ</h4>

                        <p>
                            Тарифҳои ${service.label}-и филиали
                            ${branch.name} ҳоло ворид нашудаанд.
                            Барои нархи дақиқ бо оператор тамос гиред.
                        </p>

                        <a
                            href="${contactUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mt-5 inline-flex items-center justify-center
                                   rounded-2xl bg-blue-600 px-5 py-3
                                   font-black text-white shadow-lg
                                   shadow-blue-500/20 transition
                                   hover:bg-blue-700">
                            Бо оператор тамос гирифтан
                        </a>
                    </div>
                </div>
            `;

            return;
        }

        const rows = service.rates
            .map((rate) => {
                return `
                    <div class="tariff-rate-row">
                        <p class="tariff-range">
                            ${rate.range}
                        </p>

                        <p class="tariff-price">
                            <strong>${formatPrice(rate.price)}</strong>
                            <span>сомонӣ / кг</span>
                        </p>
                    </div>
                `;
            })
            .join("");

        pricePanel.innerHTML = `
            <div class="tariff-table-head">
    <span>
        ${service.rangeLabel || "Вазни бор"}
    </span>

    <span>Нарх барои 1 кг</span>
</div>

<div class="tariff-rate-list">
    ${rows}
</div>

${service.note
                ? `
            <div class="tariff-service-note">
                <span>i</span>
                <p>${service.note}</p>
            </div>
        `
                : ""
            }
        `;
    }

    function renderSummary(branch, service) {
        summaryIcon.innerHTML =
            getIcon(state.service);

        summaryTitle.textContent =
            branch.name;

        summaryMode.textContent =
            service.fullLabel;

        statusElement.dataset.status =
            service.status;

        statusElement.textContent =
            service.status === "ready"
                ? "Тариф дастрас"
                : "Дар ҳоли навсозӣ";

        etaValue.textContent =
            service.eta || "Нав мешавад";

        volumeValue.textContent =
            service.volumePrice !== null
                ? `${service.volumePrice} сомонӣ`
                : service.volumeText || "Нав мешавад";

        modeBadge.innerHTML =
            `${getIcon(state.service)} ${service.label}`;

        contactLink.href =
            getContactUrl(branch, service);
    }

    function renderTariffs() {
        const branch =
            tariffData[state.branch];

        const availableServices =
            Object.keys(branch.services);

        if (
            !availableServices.includes(state.service)
        ) {
            state.service =
                availableServices[0];
        }

        const service =
            branch.services[state.service];

        renderBranchTabs();
        renderServiceTabs(branch);
        renderPricePanel(branch, service);
        renderSummary(branch, service);

        cardTitle.textContent =
            `Филиали ${branch.name}`;
    }

    branchTabs.addEventListener(
        "click",
        (event) => {
            const button = event.target.closest(
                "[data-tariff-branch]"
            );

            if (!button) return;

            state.branch =
                button.dataset.tariffBranch;

            renderTariffs();
        }
    );

    serviceTabs.addEventListener(
        "click",
        (event) => {
            const button = event.target.closest(
                "[data-tariff-service]"
            );

            if (!button) return;

            state.service =
                button.dataset.tariffService;

            renderTariffs();
        }
    );

    renderTariffs();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initTariffsSection,
        {
            once: true
        }
    );
} else {
    initTariffsSection();
}