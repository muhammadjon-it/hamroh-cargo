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
                            <svg class="ui-icon" aria-hidden="true">
                                <use href="#icon-arrow-right"></use>
                            </svg>
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
                    Масирро кушодан
                    <svg class="ui-icon" aria-hidden="true">
                        <use href="#icon-arrow-up-right"></use>
                    </svg>
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
                        <div class="tariff-update-icon" aria-hidden="true">
                            <svg class="ui-icon">
                                <use href="#icon-refresh"></use>
                            </svg>
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
                <span aria-hidden="true">
                    <svg class="ui-icon"><use href="#icon-info"></use></svg>
                </span>
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
function initCargoCalculator() {
    const root =
        document.querySelector("[data-cargo-calculator]");

    if (
        !root ||
        root.dataset.cargoCalculatorReady === "true"
    ) {
        return;
    }

    root.dataset.cargoCalculatorReady = "true";

    const tariffs = {
        dushanbe: {
            name: "Душанбе",

            auto: {
                eta: "15–25 рӯз",
                volumeRate: 2590,

                tiers: [
                    { max: 30, rate: 27.5 },
                    { max: 50, rate: 26.5 },
                    { max: 100, rate: 25.5 },
                    { max: 500, rate: 22 },
                    { max: 1000, rate: 17 }
                ]
            },

            air: {
                eta: "2–10 рӯз",
                rate: 79
            }
        },

        hamadoni: {
            name: "Ҳамадонӣ",

            auto: {
                eta: "15–25 рӯз",
                volumeRate: 2650,

                tiers: [
                    { max: 30, rate: 28.5 },
                    { max: 50, rate: 27 },
                    { max: 100, rate: 26 },
                    { max: 500, rate: 23 },
                    { max: Infinity, rate: 20 }
                ]
            }
        },

        bokhtar: {
            name: "Бохтар",

            auto: {
                eta: "15–25 рӯз",
                volumeRate: 2650,

                tiers: [
                    { max: 30, rate: 28.5 },
                    { max: 50, rate: 27 },
                    { max: 100, rate: 26 },
                    { max: 500, rate: 23 },
                    { max: Infinity, rate: 20 }
                ]
            }
        },

        khujand: {
            name: "Хуҷанд",

            auto: {
                eta: "15–25 рӯз",
                volumeRate: 2590,

                tiers: [
                    { max: 30, rate: 28.5 },
                    { max: 50, rate: 27 },
                    { max: 100, rate: 26 },
                    { max: Infinity, rate: 23 }
                ]
            }
        }
    };

    const unitFactors = {
        mm: 0.001,
        cm: 0.01,
        m: 1
    };

    const unitLabels = {
        mm: "мм",
        cm: "см",
        m: "м"
    };

    const modeLabels = {
        auto: "Авто",
        air: "Авиа"
    };

    const state = {
        branch: null,
        mode: null,
        unit: "cm",
        attempted: false,
        hasResult: false
    };

    const form =
        root.querySelector("[data-calc-form]");

    const branchButtons = [
        ...root.querySelectorAll("[data-calc-branch]")
    ];

    const modeButtons = [
        ...root.querySelectorAll("[data-calc-mode]")
    ];

    const unitButtons = [
        ...root.querySelectorAll("[data-calc-unit]")
    ];

    const modeGroup =
        root.querySelector("[data-calc-mode-group]");

    const airHint =
        root.querySelector("[data-air-calculation-hint]");

    const inputs = {
        length: root.querySelector("[data-calc-length]"),
        width: root.querySelector("[data-calc-width]"),
        height: root.querySelector("[data-calc-height]"),
        weight: root.querySelector("[data-calc-weight]")
    };

    const resultCard =
        root.querySelector("[data-result-card]");

    const resultEmpty =
        root.querySelector("[data-result-empty]");

    const resultSuccess =
        root.querySelector("[data-result-success]");

    const resultAmount =
        root.querySelector("[data-result-amount]");

    const resultMethod =
        root.querySelector("[data-result-method]");

    const resultMeta =
        root.querySelector("[data-result-meta]");

    const resultWeightLabel =
        root.querySelector("[data-result-weight-label]");

    const resultWeightValue =
        root.querySelector("[data-result-weight-value]");

    const resultVolumeLabel =
        root.querySelector("[data-result-volume-label]");

    const resultVolumeValue =
        root.querySelector("[data-result-volume-value]");

    const resultMessage =
        root.querySelector("[data-result-message]");

    const moneyFormatter =
        new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const numberFormatter =
        new Intl.NumberFormat("ru-RU", {
            maximumFractionDigits: 2
        });

    const volumeFormatter =
        new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        });

    function parsePositiveNumber(rawValue) {
        const raw =
            String(rawValue ?? "").trim();

        if (!raw) {
            return {
                valid: false,
                empty: true,
                value: null
            };
        }

        const normalized =
            raw.replace(",", ".");

        if (
            !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(
                normalized
            )
        ) {
            return {
                valid: false,
                empty: false,
                value: null
            };
        }

        const value =
            Number(normalized);

        return {
            valid:
                Number.isFinite(value) &&
                value > 0,

            empty: false,
            value
        };
    }

    function clearErrors() {
        root
            .querySelectorAll(".has-error")
            .forEach((group) => {
                group.classList.remove("has-error");
            });

        root
            .querySelectorAll(".is-invalid")
            .forEach((element) => {
                element.classList.remove("is-invalid");
                element.removeAttribute("aria-invalid");
            });

        root
            .querySelectorAll("[data-calc-error]")
            .forEach((error) => {
                error.textContent = "";
                error.hidden = true;
            });
    }

    function showErrors(errors, focusFirst = false) {
        clearErrors();

        const shownGroups = new Set();

        errors.forEach((error) => {
            const group =
                root.querySelector(
                    `[data-calc-group="${error.group}"]`
                );

            group?.classList.add("has-error");

            error.targets.forEach((target) => {
                target?.classList.add("is-invalid");
                target?.setAttribute(
                    "aria-invalid",
                    "true"
                );
            });

            if (!shownGroups.has(error.group)) {
                const output =
                    root.querySelector(
                        `[data-calc-error="${error.group}"]`
                    );

                if (output) {
                    output.textContent =
                        error.message;

                    output.hidden = false;
                }

                shownGroups.add(error.group);
            }
        });

        if (
            focusFirst &&
            errors.length > 0
        ) {
            const target =
                errors[0].targets[0];

            const reduceMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

            target?.scrollIntoView({
                behavior:
                    reduceMotion
                        ? "auto"
                        : "smooth",

                block: "center"
            });

            window.setTimeout(() => {
                target?.focus({
                    preventScroll: true
                });
            }, reduceMotion ? 0 : 350);
        }
    }

    function syncControls() {
        branchButtons.forEach((button) => {
            button.setAttribute(
                "aria-checked",
                String(
                    button.dataset.calcBranch ===
                    state.branch
                )
            );
        });

        const isDushanbe =
            state.branch === "dushanbe";

        modeGroup.hidden =
            !isDushanbe;

        modeButtons.forEach((button) => {
            button.setAttribute(
                "aria-checked",
                String(
                    button.dataset.calcMode ===
                    state.mode
                )
            );
        });

        unitButtons.forEach((button) => {
            button.setAttribute(
                "aria-checked",
                String(
                    button.dataset.calcUnit ===
                    state.unit
                )
            );
        });

        root
            .querySelectorAll(
                "[data-dimension-unit-label]"
            )
            .forEach((label) => {
                label.textContent =
                    unitLabels[state.unit];
            });

        airHint.hidden =
            !(
                state.branch === "dushanbe" &&
                state.mode === "air"
            );
    }

    function validate() {
        const errors = [];

        if (!state.branch) {
            errors.push({
                group: "branch",
                message:
                    "Аввал филиалро интихоб кунед.",
                targets: branchButtons
            });
        }

        if (
            state.branch === "dushanbe" &&
            !state.mode
        ) {
            errors.push({
                group: "mode",
                message:
                    "Тарзи интиқолро интихоб кунед.",
                targets: modeButtons
            });
        }

        const parsedDimensions = {
            length:
                parsePositiveNumber(
                    inputs.length.value
                ),

            width:
                parsePositiveNumber(
                    inputs.width.value
                ),

            height:
                parsePositiveNumber(
                    inputs.height.value
                )
        };

        const invalidDimensionInputs =
            Object.entries(parsedDimensions)
                .filter(([, parsed]) => {
                    return !parsed.valid;
                })
                .map(([key]) => inputs[key]);

        if (
            invalidDimensionInputs.length > 0
        ) {
            errors.push({
                group: "dimensions",
                message:
                    "Дарозӣ, бар ва баландии борро пурра ворид кунед.",
                targets:
                    invalidDimensionInputs
            });
        }

        const parsedWeight =
            parsePositiveNumber(
                inputs.weight.value
            );

        if (
            !parsedWeight.valid ||
            parsedWeight.value < 1
        ) {
            errors.push({
                group: "weight",
                message:
                    parsedWeight.empty
                        ? "Вазни борро ворид кунед."
                        : "Вазн бояд на кам аз 1 кг бошад.",

                targets: [inputs.weight]
            });
        }

        if (
            state.branch === "dushanbe" &&
            state.mode === "auto" &&
            parsedWeight.valid &&
            parsedWeight.value > 1000
        ) {
            errors.push({
                group: "weight",
                message:
                    "Барои бори зиёда аз 1000 кг бо филиали Душанбе тамос гиред.",

                targets: [inputs.weight]
            });
        }

        return {
            valid: errors.length === 0,
            errors,

            values: {
                length:
                    parsedDimensions.length.value,

                width:
                    parsedDimensions.width.value,

                height:
                    parsedDimensions.height.value,

                weight:
                    parsedWeight.value
            }
        };
    }

    function calculate(values) {
        const branch =
            tariffs[state.branch];

        const mode =
            state.branch === "dushanbe"
                ? state.mode
                : "auto";

        const factor =
            unitFactors[state.unit];

        const volumeM3 =
            values.length *
            values.width *
            values.height *
            Math.pow(factor, 3);

        if (
            state.branch === "dushanbe" &&
            mode === "air"
        ) {
            const rate =
                branch.air.rate;

            const weightCost =
                values.weight * rate;

            return {
                method: "weight",
                total: weightCost,
                weightCost,
                volumeCost: null,
                volumeM3,
                rate,
                branch,
                mode,
                eta: branch.air.eta,
                values,

                message:
                    "Бори шумо аз рӯи вазн ҳисоб шуд. Андозаҳо ба нархи Авиа ҳоло таъсир намекунанд."
            };
        }

        const autoTariff =
            branch.auto;

        const tier =
            autoTariff.tiers.find((item) => {
                return values.weight <= item.max;
            });

        const rate =
            tier.rate;

        const weightCost =
            values.weight * rate;

        const volumeCost =
            volumeM3 *
            autoTariff.volumeRate;

        const useVolume =
            volumeCost > weightCost;

        const costsEqual =
            Math.abs(
                volumeCost - weightCost
            ) < 0.005;

        return {
            method:
                useVolume
                    ? "volume"
                    : "weight",

            total:
                Math.max(
                    weightCost,
                    volumeCost
                ),

            weightCost,
            volumeCost,
            volumeM3,
            rate,
            volumeRate:
                autoTariff.volumeRate,

            branch,
            mode,
            eta:
                autoTariff.eta,

            values,

            message:
                costsEqual
                    ? "Арзиши вазн ва ҳаҷм баробар баромад. Натиҷа аз рӯи вазн нишон дода шуд."
                    : useVolume
                        ? "Бори шумо аз рӯи ҳаҷм (куб) ҳисоб мешавад, зеро арзиши ҳаҷмӣ бештар аст."
                        : "Бори шумо аз рӯи вазн (кг) ҳисоб мешавад, зеро арзиши вазнӣ бештар аст."
        };
    }

    function showEmptyResult() {
        resultEmpty.hidden = false;
        resultSuccess.hidden = true;
        delete resultCard.dataset.method;
    }

    function showCalculatedResult(result) {
        resultEmpty.hidden = true;
        resultSuccess.hidden = false;

        resultCard.dataset.method =
            result.method;

        resultAmount.textContent =
            `${moneyFormatter.format(
                result.total
            )} сомонӣ`;

        resultMethod.dataset.method =
            result.method;

        resultMethod.textContent =
            result.method === "volume"
                ? "Бо ҳаҷм ҳисоб шуд"
                : "Бо вазн ҳисоб шуд";

        resultMeta.textContent =
            `${result.branch.name} • ` +
            `${modeLabels[result.mode]} • ` +
            `${result.eta}`;

        resultWeightLabel.textContent =
            `${numberFormatter.format(
                result.values.weight
            )} кг × ` +
            `${numberFormatter.format(
                result.rate
            )} сомонӣ`;

        resultWeightValue.textContent =
            `${moneyFormatter.format(
                result.weightCost
            )} сомонӣ`;

        const resultVolumeRow =
            resultVolumeLabel.parentElement;

        resultVolumeRow.hidden =
            result.volumeCost === null;

        if (result.volumeCost !== null) {
            resultVolumeLabel.textContent =
                `${volumeFormatter.format(result.volumeM3)} м³ × ` +
                `${numberFormatter.format(result.volumeRate)} сомонӣ`;

            resultVolumeValue.textContent =
                `${moneyFormatter.format(result.volumeCost)} сомонӣ`;
        }

        resultMessage.textContent =
            result.message;
    }

    function updateCalculator({
        forceErrors = false,
        focusFirst = false,
        scrollToResult = false
    } = {}) {
        const validation =
            validate();

        if (!validation.valid) {
            showEmptyResult();

            if (
                forceErrors ||
                state.attempted ||
                state.hasResult
            ) {
                showErrors(
                    validation.errors,
                    focusFirst
                );
            } else {
                clearErrors();
            }

            return;
        }

        clearErrors();

        const result =
            calculate(
                validation.values
            );

        showCalculatedResult(result);

        state.hasResult = true;

        if (
            scrollToResult &&
            window.innerWidth < 1024
        ) {
            const reduceMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

            resultCard.scrollIntoView({
                behavior:
                    reduceMotion
                        ? "auto"
                        : "smooth",

                block: "center"
            });
        }
    }

    branchButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                state.branch =
                    button.dataset.calcBranch;

                state.mode =
                    state.branch === "dushanbe"
                        ? null
                        : "auto";

                state.hasResult = false;

                syncControls();
                updateCalculator();
            }
        );
    });

    modeButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                state.mode =
                    button.dataset.calcMode;

                syncControls();
                updateCalculator();
            }
        );
    });

    unitButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                state.unit =
                    button.dataset.calcUnit;

                syncControls();
                updateCalculator();
            }
        );
    });

    Object.values(inputs).forEach((input) => {
        input.addEventListener(
            "input",
            () => {
                updateCalculator();
            }
        );
    });

    form.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            state.attempted = true;

            updateCalculator({
                forceErrors: true,
                focusFirst: true,
                scrollToResult: true
            });
        }
    );

    syncControls();
    showEmptyResult();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initCargoCalculator,
        {
            once: true
        }
    );
} else {
    initCargoCalculator();
}

function initContactForm() {
    const form = document.getElementById("contact-form");

    if (!form || form.dataset.contactReady === "true") {
        return;
    }

    form.dataset.contactReady = "true";

    const nameInput = document.getElementById("contact-name");
    const phoneInput = document.getElementById("contact-phone");
    const messageInput = document.getElementById("contact-message");
    const note = document.getElementById("contact-form-note");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.classList.add("contact-form-invalid");
            form.reportValidity();
            return;
        }

        form.classList.remove("contact-form-invalid");

        const message = [
            "Салом! Ман аз сомонаи Hamroh Cargo менависам.",
            "",
            `Ном: ${nameInput.value.trim()}`,
            `Телефон: ${phoneInput.value.trim()}`,
            `Паём: ${messageInput.value.trim()}`
        ].join("\n");

        const url = `https://wa.me/992501222235?text=${encodeURIComponent(message)}`;
        const whatsappWindow = window.open(url, "_blank");

        if (whatsappWindow) {
            whatsappWindow.opener = null;
        } else {
            window.location.href = url;
        }

        if (note) {
            note.textContent = "WhatsApp бо паёми омода кушода шуд.";
            note.classList.add("is-success");
        }
    });

    [nameInput, phoneInput, messageInput].forEach((input) => {
        input.addEventListener("input", () => {
            if (input.validity.valid) {
                input.closest(".contact-input-wrap, .contact-textarea-wrap")?.classList.remove("is-invalid");
            }

            if (note?.classList.contains("is-success")) {
                note.textContent = "Маълумоти шумо дар сомона нигоҳ дошта намешавад.";
                note.classList.remove("is-success");
            }
        });

        input.addEventListener("invalid", () => {
            input.closest(".contact-input-wrap, .contact-textarea-wrap")?.classList.add("is-invalid");
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactForm, { once: true });
} else {
    initContactForm();
}
