"use client";

import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";
import { CanAccess } from "@refinedev/core";
import UnauthorizedPage from "@app/unauthorized";
// import TextArea from "antd/es/input/TextArea";

export const RegulationEdit = () => {
  const { TextArea } = Input;
  const { formProps, saveButtonProps, query } = useForm();

  const regulationsData = query?.data?.data;

  console.log(formProps.form?.getFieldsValue());

  return (
    <CanAccess
      resource="regulations"
      action="edit"
      fallback={<UnauthorizedPage />}
    >
      <Edit saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <Form.Item label="Name" name={["name"]} rules={[{ required: true }]}>
            <Input placeholder="Masukkan nama peraturan" />
          </Form.Item>
          <Form.Item
            label="Description"
            name={["description"]}
            rules={[{ required: true }]}
          >
            <TextArea rows={4} placeholder="Masukkan deskripsi peraturan" />
          </Form.Item>
          <Form.Item
            label="Point"
            name={["point"]}
            rules={[{ required: true }]}
          >
            <Input placeholder="Masukkan poin" />
          </Form.Item>
          <Form.Item label="Type" name={["type"]} rules={[{ required: true }]}>
            <Select placeholder="Pilih Tipe">
              <Select.Option value="Pelanggaran">
                Ketertiban / Pelanggaran
              </Select.Option>
              <Select.Option value="Penghargaan">
                Prestasi / Penghargaan
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Category"
            name={"category"}
            rules={[{ required: true }]}
          >
            <Select placeholder="Pilih Kategori">
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
              <Select.OptGroup label="Penghargaan">
                <Select.Option value="Akademik">Akademik</Select.Option>
                <Select.Option value="Non-Akademik">Non-Akademik</Select.Option>
                <Select.Option value="Prestasi">Prestasi</Select.Option>
                <Select.Option value="Kedisiplinan">Kedisiplinan</Select.Option>
                <Select.Option value="Kepemimpinan">Kepemimpinan</Select.Option>
                <Select.Option value="Sosial">Sosial</Select.Option>
                <Select.Option value="Kreativitas">Kreativitas</Select.Option>
                <Select.Option value="Olahraga">Olahraga</Select.Option>
              </Select.OptGroup>
            </Select>
          </Form.Item>
          <Form.Item
            label="Sanksi / Tindakan"
            name={["actionTaken"]}
            rules={[{ required: true }]}
          >
            <Input placeholder="Masukkan sanksi / tindakan" />
          </Form.Item>
        </Form>
      </Edit>
    </CanAccess>
  );
};
