import "./ManageSite.scss";
import PieChart from "../../components/piechart/Piechart.tsx";
import LineChart from "../../components/Linechart/Linechart.tsx";
import BarChart from "../../components/verticalchart/verticalchart.tsx";

export default function ManageSite() {
    return (
        <div className="mainchart" dir="rtl" style={{ fontFamily: "Vazirani, system-ui, sans-serif" }}>
            {/* Dashboard Heading */}
            <div className="dash-h1">
                <h1 className="dashtext">داشبورد مدیریت سایت</h1>
            </div>


            <div className="kpi-row">
                <div className="kpi-card">
                    <span className="kpi-title">کاربران فعال</span>
                    <span className="kpi-value">1,245</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-title">درآمد ماهانه</span>
                    <span className="kpi-value">5,320,000 R</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-title">تیکت‌های باز</span>
                    <span className="kpi-value">12</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-title">وظایف تکمیل‌شده</span>
                    <span className="kpi-value">98%</span>
                </div>
            </div>


            <div className="chart-frame h-75">
                <div className="pichart-frame">
                    <PieChart />
                    <div className="bg-danger pi-color">
                        <span className="fs-2 text-white">نمودار 1</span>
                    </div>
                </div>

                <div className="pichart-frame linear-chart">
                    <LineChart />
                    <div className="bg-primary pi-color">
                        <span className="fs-2 text-white">نمودار 2</span>
                    </div>
                </div>

                <div className="pichart-frame d-flex justify-content-center align-items-center">
                    <BarChart />
                    <div className="bg-warning pi-color">
                        <span className="fs-2 text-white">نمودار 3</span>
                    </div>
                </div>
            </div>


            <div className="recent-activity">
                <h3>فعالیت‌های اخیر</h3>
                <ul>
                    <li>تیکت جدید از کاربر 245 ارسال شد</li>
                    <li>درآمد ماهانه 1,245 R به‌روزرسانی شد</li>
                    <li>وظایف تکمیل شده: 98%</li>
                    <li>کاربر جدید ثبت نام کرد: علی محمدی</li>
                </ul>
            </div>
        </div>
    );
}
