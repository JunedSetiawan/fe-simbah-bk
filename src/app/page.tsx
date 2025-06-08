"use client";

import { Suspense, useEffect, useState } from "react";
import Swiper from "swiper/bundle";
import { Pagination } from "swiper/modules";
import "swiper/css/bundle";
import "swiper/css/pagination";
import "swiper/css/effect-cards";
import { Card, Button, notification, Badge, FloatButton } from "antd";
import {
  MessageOutlined,
  NotificationOutlined,
  TrophyOutlined,
  UserOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  CommentOutlined,
  HomeOutlined,
  WhatsAppOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import LogoImage from "@/public/logo/logo-smkn-jenangan.png";
import Image from "next/image";
import { Link } from "@refinedev/core";
import InstallButton from "@components/installButton";

export default function IndexPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sample data
  const awardsData = [
    {
      title: "Siswa Berprestasi",
      description: "Penghargaan yang menyangkut Akademik atau sejenisnya",
    },
    {
      title: "Siswa Teladan",
      description: "Penghargaan yang menyangkut Non-Akademik atau sejenisnya",
    },
  ];

  const callData = [
    {
      title: "Panggilan Orang Tua",
      description: "Membahas perkembangan akademik",
    },
    { title: "Konseling BK", description: "Sesi konseling masalah belajar" },
  ];

  // Fix hydration by ensuring component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && mounted) {
      import("swiper/bundle").then((SwiperModule) => {
        const Swiper = SwiperModule.default;

        const swiper = new Swiper(".proofSlides", {
          effect: "cube",
          cubeEffect: {
            slideShadows: false,
            shadow: false,
            shadowOffset: 20,
            shadowScale: 0.94,
          },
          loop: true,
          autoplay: {
            delay: 4000,
            disableOnInteraction: false,
          },
          grabCursor: true,
          centeredSlides: true,
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
          // Tambahan untuk mencegah overflow
          preventInteractionOnTransition: true,
          watchOverflow: true,
          observer: true,
          observeParents: true,
        });
      });
    }
  }, [mounted]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/+6282365265904", "_blank");
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Suspense>
      <main className="bg-white">
        <header>
          <nav className="fixed overflow-hidden z-20 w-full bg-white/80 rounded-b-lg border-b border-gray-200 backdrop-blur-2xl">
            <div className="px-6 m-auto max-w-6xl 2xl:px-0">
              <div className="flex flex-wrap items-center justify-between py-2 sm:py-4">
                <div className="w-full items-center flex justify-between lg:w-auto">
                  <a
                    href="/"
                    aria-label="tailus logo"
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={LogoImage}
                      alt="Logo"
                      style={{ height: "36px", width: "auto" }}
                    />
                    <span>SI - PEKA</span>
                  </a>
                  <div className="flex lg:hidden">
                    <button
                      aria-label="hamburger"
                      onClick={toggleMenu}
                      className="relative border border-gray-950/30 size-9 rounded-full transition duration-300 active:scale-95"
                    >
                      <div
                        className={`m-auto h-0.5 w-4 rounded bg-gray-900 transition duration-300 ${
                          isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                        }`}
                      ></div>
                      <div
                        className={`m-auto mt-1.5 h-0.5 w-4 rounded bg-gray-900 transition duration-300 ${
                          isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>

                <div
                  className={`w-full flex-wrap justify-end items-center space-y-8 lg:space-y-0 lg:flex lg:h-fit md:flex-nowrap transition-all duration-300 ${
                    isMenuOpen
                      ? "h-auto opacity-100 mt-6"
                      : "h-0 opacity-0 lg:opacity-100 lg:h-fit overflow-hidden lg:overflow-visible"
                  } lg:w-fit`}
                >
                  <div className="w-full space-y-2 gap-2 pt-6 pb-4 lg:pb-0 border-t border-gray-200 items-center flex flex-col lg:flex-row lg:space-y-0 lg:w-fit lg:border-l lg:border-t-0 lg:pt-0 lg:pl-2">
                    <Link to="/login">
                      <Button type="primary" className="w-full lg:w-auto">
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>
        <main className="overflow-hidden">
          <section className="relative">
            <div className="relative pt-24 lg:pt-28">
              <div className="mx-auto px-6 max-w-7xl md:px-12">
                <div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
                  <h1 className="mt-8 text-wrap text-4xl md:text-5xl font-semibold text-gray-950 xl:text-5xl xl:[line-height:1.125]">
                    Sistem Informasi Pencatatan Bimbingan Konseling
                  </h1>
                  <p className="text-wrap mx-auto mt-8 max-w-2xl text-lg text-gray-700">
                    Platform terintegrasi untuk manajemen disiplin, pelanggaran,
                    konseling, dan kunjungan rumah di SMKN 1 Jenangan Ponorogo
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-4">
                    <Link to="/login">
                      <Button type="primary" size="large">
                        Mulai Menggunakan
                      </Button>
                    </Link>
                    <Link to="/files/BUKU_PANDUAN_SEDERHANA_UNTUK_ORANG_TUA_SISWA.pdf">
                      <Button type="default" size="large">
                        Unduh Dokumentasi Untuk Pengguna Orang Tua Siswa
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="-mx-6 relative mt-8 sm:mt-12 max-w-xl sm:mx-auto">
                  <div className="absolute inset-0 -top-8 left-1/2 -z-20 h-56 w-full -translate-x-1/2 [background-image:linear-gradient(to_bottom,transparent_98%,theme(colors.gray.200/75%)_98%),linear-gradient(to_right,transparent_94%,_theme(colors.gray.200/75%)_94%)] [background-size:16px_35px] [mask:radial-gradient(black,transparent_95%)]"></div>
                  <div className="absolute top-12 inset-x-0 w-2/3 h-1/3 -z-[1] rounded-full bg-primary-300 mx-auto blur-3xl"></div>

                  <div className="swiper proofSlides relative overflow-hidden">
                    <div className="swiper-wrapper">
                      {/* Slide 1 - Manajemen Tatib dan Disiplin */}
                      <div className="px-6 pt-2 pb-12 swiper-slide">
                        <div className="animated-border shadow-xl shadow-gray-950/5 relative z-10">
                          <div className="animated-border-content p-6 overflow-hidden">
                            <div className="h-12 w-12 mx-auto bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                              <FileTextOutlined />
                            </div>
                            <h3 className="mt-6 text-lg text-gray-950 text-center font-semibold">
                              Manajemen Tatib dan Disiplin
                            </h3>
                            <div className="mt-4 space-y-4 relative z-20">
                              <Card size="small" className="relative z-30">
                                <Card.Meta
                                  title="Tata Tertib"
                                  description="Sistem pencatatan peraturan dengan kategori Pelanggaran dan Penghargaan dengan point dan sanksi yang sesuai"
                                />
                              </Card>
                              <Card size="small" className="relative z-30">
                                <Card.Meta
                                  title="Filter Pencarian"
                                  description="Disesuaikan dengan Data yang ada"
                                />
                              </Card>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Slide 2 - Sistem Pelanggaran */}
                      <div className="px-6 pt-2 pb-12 swiper-slide">
                        <div className="animated-border shadow-xl shadow-gray-950/5 relative z-10">
                          <div className="animated-border-content p-6 overflow-hidden">
                            <div className="h-12 w-12 mx-auto bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                              <CalculatorOutlined />
                            </div>
                            <h3 className="mt-6 text-lg text-gray-950 text-center font-semibold">
                              Sistem Pelanggaran
                            </h3>
                            <div className="mt-4 space-y-4 relative z-20">
                              <Card size="small" className="relative z-30">
                                <Card.Meta
                                  title="Pencatatan"
                                  description="Sistem pencatatan pelanggaran siswa dengan point dan sanksi"
                                />
                              </Card>
                              <Card size="small" className="relative z-30">
                                <Card.Meta
                                  title="Fitur siswa bermasalah dalam satu sekolah"
                                  description="Filter dalam rentang tahun ajaran dan semester"
                                />
                              </Card>
                              <div className="flex flex-wrap gap-2 mt-4 relative z-30">
                                <Badge
                                  count={
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                      <WhatsAppOutlined />
                                      Include Notifikasi WA
                                    </span>
                                  }
                                />
                                <Badge
                                  count={
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                      <BarChartOutlined />
                                      Include Rekapitulasi
                                    </span>
                                  }
                                />
                                <Badge
                                  count={
                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                      <FileTextOutlined />
                                      Cetak Surat SP & Panggilan
                                    </span>
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Slide 3 - Penghargaan Siswa */}
                      <div className="px-6 pt-2 pb-12 swiper-slide">
                        <div className="animated-border shadow-xl shadow-gray-950/5 relative z-10">
                          <div className="animated-border-content p-6 overflow-hidden">
                            <div className="h-12 w-12 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                              <TrophyOutlined />
                            </div>
                            <h3 className="mt-6 text-lg text-gray-950 text-center font-semibold">
                              Penghargaan Siswa
                            </h3>
                            <div className="mt-4 space-y-4 relative z-20">
                              {awardsData.map((item, index) => (
                                <Card
                                  key={index}
                                  size="small"
                                  className="relative z-30"
                                >
                                  <Card.Meta
                                    title={item.title}
                                    description={item.description}
                                  />
                                </Card>
                              ))}
                              <div className="flex flex-wrap gap-2 mt-4 relative z-30">
                                <Badge
                                  count={
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                      <BarChartOutlined />
                                      Include Rekapitulasi
                                    </span>
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Slide 4 - Konseling */}
                      <div className="px-6 pt-2 pb-12 swiper-slide">
                        <div className="animated-border shadow-xl shadow-gray-950/5 relative z-10">
                          <div className="animated-border-content p-6 overflow-hidden">
                            <div className="h-12 w-12 mx-auto bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                              <CommentOutlined />
                            </div>
                            <h3 className="mt-6 text-lg text-gray-950 text-center font-semibold">
                              Konseling
                            </h3>
                            <div className="mt-4 space-y-4 relative z-20">
                              <Card size="small" className="relative z-30">
                                <Card.Meta
                                  title="Sesi BK Terintegrasi"
                                  description="Platform konseling dengan penjadwalan dan dokumentasi sesi BK"
                                />
                              </Card>
                              <Card size="small" className="relative z-30">
                                <Card.Meta
                                  title="Follow-up Progress"
                                  description="Tracking dan monitoring progress konseling siswa secara berkelanjutan"
                                />
                              </Card>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Slide 5 - Kunjungan Rumah */}
                      <div className="px-6 pt-2 pb-12 swiper-slide">
                        <div className="animated-border shadow-xl shadow-gray-950/5 relative z-10">
                          <div className="animated-border-content p-6 overflow-hidden">
                            <div className="h-12 w-12 mx-auto bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                              <HomeOutlined />
                            </div>
                            <h3 className="mt-6 text-lg text-gray-950 text-center font-semibold">
                              Kunjungan Rumah Terjadwal
                            </h3>
                            <div className="mt-4 space-y-4 relative z-20">
                              <Card size="small" className="relative z-30">
                                <Card.Meta
                                  title="Manajemen Jadwal"
                                  description="Penjadwalan dan koordinasi kunjungan rumah siswa dengan orang tua"
                                />
                              </Card>
                              <Card size="small" className="relative z-30">
                                <Card.Meta
                                  title="Dokumentasi Laporan"
                                  description="Laporan hasil kunjungan dan tindak lanjut yang sistematis"
                                />
                              </Card>
                              <div className="flex flex-wrap gap-2 mt-4 relative z-30">
                                <Badge
                                  count={
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                      <WhatsAppOutlined />
                                      Include Notifikasi WA
                                    </span>
                                  }
                                />
                                <Badge
                                  count={
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                      <BarChartOutlined />
                                      Include Rekapitulasi
                                    </span>
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Slide 6 - Panggilan Siswa */}
                      <div className="px-6 pt-2 pb-12 swiper-slide">
                        <div className="animated-border shadow-xl shadow-gray-950/5 relative z-10">
                          <div className="animated-border-content p-6 overflow-hidden">
                            <div className="h-12 w-12 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                              <UserOutlined />
                            </div>
                            <h3 className="mt-6 text-lg text-gray-950 text-center font-semibold">
                              Panggilan Siswa
                            </h3>
                            <div className="mt-4 space-y-4 relative z-20">
                              {callData.map((item, index) => (
                                <Card
                                  key={index}
                                  size="small"
                                  className="relative z-30"
                                >
                                  <Card.Meta
                                    title={item.title}
                                    description={item.description}
                                  />
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Floating WhatsApp Button */}
        <div
          className="fixed bottom-6 right-6 z-50 cursor-pointer"
          onClick={handleWhatsAppClick}
        >
          {/* Desktop version - with text */}
          <div className="hidden md:flex items-center bg-[#25D366] hover:bg-[#20b954] text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl">
            <WhatsAppOutlined className="text-xl mr-2" />
            <span className="text-sm font-medium whitespace-nowrap">
              Pertanyaan atau Masalah? Bisa klik disini
            </span>
          </div>

          {/* Mobile version - icon only */}
          <div className="flex md:hidden items-center justify-center bg-[#25D366] hover:bg-[#20b954] text-white w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl">
            <FloatButton
              icon={<WhatsAppOutlined />}
              type="primary"
              style={{
                right: 24,
                bottom: 24,
                backgroundColor: "#25D366",
                borderColor: "#25D366",
                width: 60,
                height: 60,
              }}
              tooltip="Pertanyaan atau Masalah? Bisa klik disini"
              onClick={handleWhatsAppClick}
            >
              <span>Pertanyaan atau Masalah? Bisa klik disini</span>
            </FloatButton>
          </div>
        </div>

        {/* Floating WhatsApp Button */}

        <footer className="rounded-xl border border-gray-200 ">
          <div className="max-w-6xl mx-auto space-y-16 px-6 py-16 text-gray-600 2xl:px-0">
            <div className="flex items-center justify-between rounded-md bg-gray-100 px-6 py-3">
              <span className="text-gray-600">
                © 2025 SMKN 1 Jenangan Ponorogo
              </span>
              <span className="text-sm text-gray-600">
                Created by{" "}
                <a
                  href="http://juned-setiawan.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-primary-600"
                >
                  Jnd
                </a>
              </span>
            </div>
          </div>
        </footer>
        <InstallButton />
      </main>
    </Suspense>
  );
}
