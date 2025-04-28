"use client";

import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { CanAccess } from "@refinedev/core";
import UnauthorizedPage from "@app/unauthorized";

export const RegulationEdit = () => {
  const { TextArea } = Input;
  const { formProps, saveButtonProps, query } = useForm();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const regulationsData = query?.data?.data;

  // Set initial values for selectedType and selectedCategory when data is loaded
  useEffect(() => {
    if (regulationsData) {
      setSelectedType(regulationsData.type);
      setSelectedCategory(regulationsData.category);
    }
  }, [regulationsData]);

  // Collection of general sanctions that apply to all categories
  const generalSanctions = [
    "Surat Pernyataan 1",
    "Surat Pernyataan 2",
    "Surat Pernyataan 3",
    "Surat Panggilan Orang Tua",
    "Surat Pernyataan 2 / Surat Panggilan Orang Tua",
    "Peringatan Lisan",
    "Skors 3 Hari",
    "Skors 6 Hari",
    "Dikeluarkan dari sekolah",
  ];

  // Collection of category-specific sanctions
  const categorySanctions: Record<string, string[]> = {
    // Specific sanctions for attendance
    Kehadiran: ["Penugasan Tambahan", "Pemotongan Nilai Kehadiran"],
    // Specific sanctions for learning activities
    "Kegiatan Pembelajaran": [
      "Penugasan Ulang",
      "Remedial",
      "Pengurangan Nilai",
      "Penugasan Tambahan",
    ],
    // Add more category-specific sanctions as needed
    "Pakaian Seragam": ["Pembenahan Seragam", "Penitipan Barang"],
    Perilaku: ["Konseling", "Pengembangan Karakter"],
    // For rewards instead of sanctions
    Akademik: [
      "Sertifikat Penghargaan",
      "Pengurangan Point Pelanggaran",
      "Beasiswa",
    ],
    "Non-Akademik": [
      "Sertifikat Penghargaan",
      "Pengurangan Point Pelanggaran",
      "Hadiah",
    ],
    // Other categories will use general sanctions by default
  };

  // Handle category change to update form values
  const handleCategoryChange = (value: React.SetStateAction<null>) => {
    setSelectedCategory(value);
    formProps.form?.setFieldsValue({ actionTaken: undefined });
  };

  // Handle type change to reset category and sanctions
  const handleTypeChange = (value: React.SetStateAction<null>) => {
    setSelectedType(value);
    setSelectedCategory(null);
    formProps.form?.setFieldsValue({
      category: undefined,
      actionTaken: undefined,
    });
  };

  // Get appropriate sanctions based on selected category
  const getAvailableSanctions = () => {
    // Always include general sanctions
    let availableSanctions = [...generalSanctions];

    // Add category-specific sanctions if available
    if (selectedCategory && categorySanctions[selectedCategory]) {
      availableSanctions = [
        ...availableSanctions,
        ...categorySanctions[selectedCategory],
      ];
    }

    return availableSanctions;
  };

  return (
    <CanAccess
      resource="regulations"
      action="edit"
      fallback={<UnauthorizedPage />}
    >
      <Edit saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <Form.Item
            label="Nama Peraturan"
            name={["name"]}
            rules={[{ required: true }]}
          >
            <Input placeholder="Masukkan Nama Peraturan" />
          </Form.Item>
          <Form.Item
            label="Deskripsi"
            name={["description"]}
            rules={[{ required: true }]}
          >
            <TextArea rows={4} placeholder="Masukkan Deskripsi" />
          </Form.Item>
          <Form.Item
            label="Point"
            name={["point"]}
            rules={[{ required: true }]}
          >
            <Input type="number" placeholder="Masukkan Point" />
          </Form.Item>
          <Form.Item
            label="Tipe Pelanggaran"
            name={["type"]}
            rules={[{ required: true }]}
          >
            <Select placeholder="Pilih Tipe" onChange={handleTypeChange}>
              <Select.Option value="Pelanggaran">
                Ketertiban / Pelanggaran
              </Select.Option>
              <Select.Option value="Penghargaan">
                Prestasi / Penghargaan
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Kategori Peraturan"
            name={["category"]}
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Pilih Kategori"
              onChange={handleCategoryChange}
              disabled={!selectedType}
            >
              {selectedType === "Pelanggaran" && (
                <Select.OptGroup label="Pelanggaran">
                  <Select.Option value="Kehadiran">Kehadiran</Select.Option>
                  <Select.Option value="Kegiatan Pembelajaran">
                    Kegiatan Pembelajaran
                  </Select.Option>
                  <Select.Option value="Pakaian Seragam">
                    Pakaian Seragam
                  </Select.Option>
                  <Select.Option value="Perilaku">Perilaku</Select.Option>
                  <Select.Option value="Makan dan Minum">
                    Makan dan Minum
                  </Select.Option>
                  <Select.Option value="Izin Meninggalkan Sekolah">
                    Izin Meninggalkan Sekolah
                  </Select.Option>
                  <Select.Option value="Tindakan Kenakalan dan Kriminalitas">
                    Tindakan Kenakalan dan Kriminalitas
                  </Select.Option>
                  <Select.Option value="Interaksi dengan Teman, Guru/Karyawan dan Pihak Lain">
                    Interaksi dengan Teman, Guru/Karyawan dan Pihak Lain
                  </Select.Option>
                  <Select.Option value="Prakerin">Prakerin</Select.Option>
                  <Select.Option value="Kebersihan">Kebersihan</Select.Option>
                  <Select.Option value="Data dan Administrasi Sekolah">
                    Data dan Administrasi Sekolah
                  </Select.Option>
                  <Select.Option value="Pembelajaran Daring">
                    Pembelajaran Daring
                  </Select.Option>
                  <Select.Option value="Lain-Lain">Lain-Lain</Select.Option>
                </Select.OptGroup>
              )}
              {selectedType === "Penghargaan" && (
                <Select.OptGroup label="Penghargaan">
                  <Select.Option value="Akademik">Akademik</Select.Option>
                  <Select.Option value="Non-Akademik">
                    Non-Akademik
                  </Select.Option>
                  <Select.Option value="Prestasi">Prestasi</Select.Option>
                  <Select.Option value="Kedisiplinan">
                    Kedisiplinan
                  </Select.Option>
                  <Select.Option value="Kepemimpinan">
                    Kepemimpinan
                  </Select.Option>
                  <Select.Option value="Sosial">Sosial</Select.Option>
                  <Select.Option value="Kreativitas">Kreativitas</Select.Option>
                  <Select.Option value="Olahraga">Olahraga</Select.Option>
                </Select.OptGroup>
              )}
            </Select>
          </Form.Item>
          <Form.Item
            label="Sanksi / Tindakan"
            name="actionTaken"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Pilih Sanksi / Tindakan"
              disabled={!selectedType}
            >
              <Select.OptGroup label="Umum">
                {generalSanctions.map((sanction, index) => (
                  <Select.Option key={`general-${index}`} value={sanction}>
                    {sanction}
                  </Select.Option>
                ))}
              </Select.OptGroup>

              {selectedCategory && categorySanctions[selectedCategory] && (
                <Select.OptGroup label={`Khusus ${selectedCategory}`}>
                  {categorySanctions[selectedCategory].map(
                    (sanction: any, index: any) => (
                      <Select.Option key={`specific-${index}`} value={sanction}>
                        {sanction}
                      </Select.Option>
                    )
                  )}
                </Select.OptGroup>
              )}
            </Select>
          </Form.Item>
        </Form>
      </Edit>
    </CanAccess>
  );
};
