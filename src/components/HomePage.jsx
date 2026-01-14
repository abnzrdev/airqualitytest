import { useCallback, useState, useEffect, lazy, Suspense } from 'react';
import { t } from '../i18n';

const AirQualityMap = lazy(() => import('./air-quality-map'));

// --- АЛМАТЫДАҒЫ ТІРКЕЛГЕН ОРЫНДАР ---
const almatyLocations = [
    { id: 1, name: "Қала орталығы", lat: 43.2505, lng: 76.9205 }, // Республика алаңына жақын
    { id: 2, name: "Медеу аймағы", lat: 43.1492, lng: 77.0505 }, // Биік жер
    { id: 3, name: "Алматы 1 Вокзалы", lat: 43.3000, lng: 76.9000 }, // Солтүстік өнеркәсіп аймағы
    { id: 4, name: "Алатау ауданы", lat: 43.3400, lng: 76.8800 } // Солтүстік-батыс маңы
];

// --- МУЛЯЖДЫҚ API ФУНКЦИЯСЫ ---
const fetchAirQuality = async (lat, lng, name) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate simulated data
    const aqi = Math.floor(Math.random() * 150) + 1;
    const pm25 = (Math.random() * 30 + 5).toFixed(1);
    const pm10 = (Math.random() * 50 + 10).toFixed(1);
    const tempC = (Math.random() * 15 + 15).toFixed(1);

    const getStatus = (value) => {
        if (value <= 50) return { label: 'Жақсы', color: 'bg-green-500', summary: 'Жақсы' };
        if (value <= 100) return { label: 'Орташа', color: 'bg-yellow-500', summary: 'Орташа' };
        if (value <= 150) return { label: 'Сезімтал топтар үшін қолайсыз', color: 'bg-orange-500', summary: 'Сақтық' };
        return { label: 'Қолайсыз', color: 'bg-red-500', summary: 'Қолайсыз' };
    };

    return {
        city: name,
        lat: lat.toFixed(4),
        lng: lng.toFixed(4),
        aqi: aqi,
        pm25: pm25,
        pm10: pm10,
        tempC: tempC,
        ...getStatus(aqi)
    };
};

// --- Компоненттің басталуы ---

const HomePage = () => {

    const [dashboardData, setDashboardData] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // --- БАРЛЫҚ ТІРКЕЛГЕН ОРЫНДАР ҮШІН ДЕРЕКТЕРДІ ЖҮКТЕУ ФУНКЦИЯСЫ ---
    const fetchAllData = useCallback(async () => {
        setIsLoadingData(true);
        const dataPromises = almatyLocations.map(loc =>
            fetchAirQuality(loc.lat, loc.lng, loc.name)
        );

        try {
            const results = await Promise.all(dataPromises);
            setDashboardData(results);
        } catch (error) {
            console.error("Барлық бақылау тақтасының деректерін жүктеу сәтсіз аяқталды:", error);
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    // --- КОМПОНЕНТ ЖҮКТЕЛГЕНДЕ ДЕРЕКТЕРДІ ЖҮКТЕУДІ БАСТАУ ---
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Leaflet map handles its own resize logic inside the component


    // --- Визуализацияға арналған статистикалық жолақ компоненті ---
    const StatBar = ({ value, max = 150, colorClass }) => {
        const percentage = Math.min(100, (value / max) * 100);
        return (
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${colorClass} h-2 rounded-full transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        );
    };

    // --- Себептер картасы компоненті ---
    const CauseCard = ({ icon, title, description }) => (
        <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 transform hover:scale-[1.02]">
            <div className="text-4xl mb-4">{icon}</div>
            <h5 className="text-lg font-semibold text-gray-800 mb-2">{title}</h5>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    );

    // --- Әрекеттер картасы компоненті ---
    const ActionCard = ({ icon, title, description, color }) => (
        <div className={`p-5 rounded-xl shadow-lg border-t-4 ${color} bg-white hover:shadow-xl transition duration-300`}>
            <div className="text-3xl mb-3">{icon}</div>
            <h5 className="text-lg font-bold text-gray-800 mb-1">{title}</h5>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    );

    // --- Термин картасы компоненті ---
    const TerminologyCard = ({ title, description, color }) => (
        <div className={`p-5 rounded-xl border border-gray-200 ${color} shadow-sm`}>
            <h5 className="text-lg font-bold text-gray-900 mb-2">{title}</h5>
            <p className="text-sm text-gray-700">{description}</p>
        </div>
    );

    // --- Тарихи трендтер компоненті ---
    const HistoricalTrend = () => {
        // Мұнда нақты API деректері болмағандықтан, трендтерді имитациялаймыз
        const mockTrends = [
            { day: 'Дс', aqi: 120, label: 'Сақтық', color: 'bg-orange-500' },
            { day: 'Сс', aqi: 105, label: 'Сақтық', color: 'bg-orange-500' },
            { day: 'Ср', aqi: 85, label: 'Орташа', color: 'bg-yellow-500' },
            { day: 'Бс', aqi: 70, label: 'Орташа', color: 'bg-yellow-500' },
            { day: 'Жм', aqi: 55, label: 'Орташа', color: 'bg-yellow-500' },
            { day: 'Сб', aqi: 35, label: 'Жақсы', color: 'bg-green-500' },
            { day: 'Жк', aqi: 40, label: 'Жақсы', color: 'bg-green-500' },
        ];

        // Максималды AQI мәні 150 деп аламыз
        const maxAqi = 150;

        return (
            <div className="bg-white p-6 rounded-xl shadow-2xl mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Соңғы аптадағы трендтер (Орташа АҚИ)</h3>

                <div className="flex justify-between items-end h-32 space-x-2 border-b border-gray-300 pt-2">
                    {mockTrends.map((dayData, index) => (
                        <div key={index} className="flex flex-col items-center justify-end h-full group">
                            {/* Гистограмманың үстіндегі мәтін (hover) */}
                            <span className="text-xs font-semibold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition duration-300">
                                {dayData.aqi}
                            </span>
                            {/* Гистограмма жолағы */}
                            <div
                                className={`w-8 rounded-t-lg ${dayData.color} transition-all duration-500`}
                                style={{ height: `${(dayData.aqi / maxAqi) * 100}%` }}
                            ></div>
                            {/* Күн белгісі */}
                            <span className="text-xs font-medium text-gray-500 mt-1">{dayData.day}</span>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-gray-600 mt-3">
                    <span className="font-bold text-red-500">Ластану шыңы:</span> Жұмыс аптасының басында ластанудың ең жоғары деңгейі байқалды, бұл көлік қозғалысының әсерін көрсетеді.
                </p>
            </div>
        );
    };


    // Негізгі компонентті көрсету
    return (
        <div className="antialiased min-h-screen">

            {/* Карта контейнері - ЖАҢАРТЫЛҒАН: mt-4 қосылды */}
            <section
                id="home-map-container"
                className="relative shadow-2xl overflow-hidden mb-8 mt-4"
                style={{ height: '70vh', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}
            >
                {isClient ? (
                    <Suspense
                        fallback={(
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm text-gray-700 text-sm">
                                Карта жүктелуде...
                            </div>
                        )}
                    >
                        <AirQualityMap />
                    </Suspense>
                ) : (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 text-gray-700 text-sm">
                        Карта дайындалуда...
                    </div>
                )}

                {/* Карта үстіндегі нұсқаулықтар */}
                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm text-gray-700 font-medium z-30">
                    {t('map.quickHint', 'kk')}
                </div>
            </section>

            {/* Статистикалық бақылау тақтасы: График және Кесте */}
            <section className="max-w-7xl mx-auto mb-10">
                <div className="bg-white p-6 rounded-xl shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                        Алматы ауа сапасының бақылау тақтасы
                    </h3>

                    {isLoadingData ? (
                        <div className="p-8 text-center text-gray-500">Нақты уақыттағы сенсор деректері жүктелуде...</div>
                    ) : (
                        <div className="space-y-6">

                            {/* Визуалды АҚИ гистограммасы */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-700 mb-3">АҚИ шолуы (Макс 150)</h4>
                                <div className="space-y-4">
                                    {dashboardData.map(data => (
                                        <div key={data.city} className="flex items-center space-x-4">
                                            <p className="w-32 font-medium text-gray-600 text-sm truncate">{data.city}</p>
                                            <StatBar value={data.aqi} colorClass={data.color} />
                                            <p className="w-12 text-right font-bold text-sm">{data.aqi}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Толық кесте */}
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Орналасқан жері</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">АҚИ</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">МБ2.5 (µg/m³)</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Температура (°C)</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Мәртебесі</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData.map((data, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{data.city}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <span className={`text-white px-2 py-0.5 rounded-full text-xs font-bold ${data.color}`}>{data.aqi}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{data.pm25}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 font-medium">{data.tempC}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{data.label}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {/* БАҚЫЛАУ ТАҚТАСЫ БӨЛІМІНІҢ СОҢЫ */}

            {/* ----------------------------------------------------------------- */}
            {/* ТАРИХИ ТРЕНДТЕР */}
            {/* ----------------------------------------------------------------- */}
            <section id="historical-trends" className="max-w-7xl mx-auto mb-10">
                <HistoricalTrend />
            </section>

            {/* ----------------------------------------------------------------- */}
            {/* АҚПАРАТ ЖӘНЕ БОЛЖАМ СЕКЦИЯСЫ */}
            {/* ----------------------------------------------------------------- */}
            <section id="info-forecast" className="max-w-7xl mx-auto mb-10 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 1. БОЛЖАМ КАРТАСЫ */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                            Ауа сапасының болжамы (Ертең)
                        </h3>
                        <p className="text-4xl font-extrabold text-yellow-600 mb-2">Орташа (65 АҚИ)</p>
                        <p className="text-gray-600 mb-4">
                            Көлік қозғалысының азаюына байланысты шамалы жақсару күтіледі. Сезімтал топтарға таңертеңгі уақытта сыртқа шығуды шектеу ұсынылады.
                        </p>
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t mt-3">
                            <span>Келесі апта: Сақтық</span>
                            <span className="text-blue-600">Толығырақ</span>
                        </div>
                    </div>

                    {/* 2. ТҮСІНІКТЕМЕ КАРТАЛАРЫ */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                            Негізгі терминдерді түсіндіру
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <TerminologyCard
                                title="АҚИ (AQI)"
                                description="Ауа сапасының индексі. Бұл сіздің орналасқан жеріңіздегі ауаның қаншалықты таза немесе лас екенін көрсететін сандық шкала."
                                color="bg-green-50"
                            />
                            <TerminologyCard
                                title="PM2.5"
                                description="Диаметрі 2.5 микрометрден аз ұсақ бөлшектер. Олар өкпеге терең еніп, денсаулыққа қауіп төндіреді."
                                color="bg-yellow-50"
                            />
                            <TerminologyCard
                                title="PM10"
                                description="Диаметрі 10 микрометрден аз бөлшектер. Көбінесе құрылыс пен жол шаңынан пайда болады, мұрынға, тамаққа әсер етеді."
                                color="bg-orange-50"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ----------------------------------------------------------------- */}
            {/* ЛАС АУАНЫҢ СЕБЕПТЕРІ БӨЛІМІ */}
            {/* ----------------------------------------------------------------- */}
            <section id="air-pollution-causes" className="max-w-7xl mx-auto mb-10 mt-10">
                <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 text-center">
                        Лас ауаның негізгі себептері
                    </h3>
                    <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
                        Алматыда ауаның ластануына әкелетін негізгі антропогендік факторлар.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CauseCard
                            icon="🚗"
                            title="Көлік шығарындылары"
                            description="Қала ішіндегі ескі көліктерден шығатын азот оксидтері мен ұсақ бөлшектер (PM) ластанудың ең үлкен көзі болып табылады."
                        />
                        <CauseCard
                            icon="🔥"
                            title="Жеке жылыту"
                            description="Қыс мезгілінде қала маңындағы үйлерде көмір мен арзан отынды пайдалану атмосфераға зиянды түтін мен күйе шығарады."
                        />
                        <CauseCard
                            icon="🏭"
                            title="Өнеркәсіптік әсер"
                            description="Жергілікті жылу электр станциялары мен өндіріс орындарынан шығатын газдар мен ауыр бөлшектер (күкірт диоксиді) ауа сапасына әсер етеді."
                        />
                        <CauseCard
                            icon="⛰️"
                            title="Географиялық фактор"
                            description="Алматы таулармен қоршалған, бұл қыс мезгілінде инверсиялық қабатты тудырады. Ластағыш заттар қала үстінде жиналып, тарай алмайды."
                        />
                    </div>
                </div>
            </section>

            {/* ----------------------------------------------------------------- */}
            {/* ӘРЕКЕТ ЕТУ КЕҢЕСТЕРІ */}
            {/* ----------------------------------------------------------------- */}
            <section id="actionable-solutions" className="max-w-7xl mx-auto mb-10 mt-10">
                <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                        Ауа сапасын жақсарту үшін не істеуге болады?
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ActionCard
                            icon="🚶‍♂️"
                            title="Қоғамдық көлік / Жүру"
                            description="Қала ішінде мүмкіндігінше жеке көлікті пайдалануды азайтыңыз. Бұл шығарындыларды бірден төмендетеді."
                            color="border-blue-500"
                        />
                        <ActionCard
                            icon="💡"
                            title="Энергияны үнемдеу"
                            description="Үйде энергияны үнемдеу шараларын қолданыңыз. Жылуды тиімді пайдалану көмірге деген сұранысты азайтады."
                            color="border-yellow-500"
                        />
                        <ActionCard
                            icon="📲"
                            title="Хабардар болыңыз"
                            description="Осы бақылау тақтасы арқылы ауа сапасын үнемі тексеріп, ауа лас кезде таза ауада болуды шектеңіз."
                            color="border-green-500"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;