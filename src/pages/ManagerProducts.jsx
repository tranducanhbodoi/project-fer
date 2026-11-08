import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Table, Pagination } from 'react-bootstrap';

const initialForm = {
  name: '',
  category: 'Điện thoại',
  brand: 'Apple',
  price: '',
  stock: '',
  image: '',
  description: '',
};

const ManagerProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:9999/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      if (editingId) {
        await fetch(`http://localhost:9999/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await fetch('http://localhost:9999/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        alert('Thêm sản phẩm mới thành công!');
      }

      setFormData(initialForm);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error('Lỗi khi lưu sản phẩm:', err);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      category: product.category || 'Điện thoại',
      brand: product.brand || 'Apple',
      price: product.price || '',
      stock: product.stock || '',
      image: product.image || '',
      description: product.description || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await fetch(`http://localhost:9999/products/${id}`, {
        method: 'DELETE',
      });
      fetchProducts();
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Container className="mt-3 mb-4">
      <h3 className="mb-3">Quản Lý Sản Phẩm</h3>

      <Card className="p-3 mb-4">
        <h5 className="mb-3">
          {editingId ? `Sửa sản phẩm ID: ${editingId}` : 'Thêm sản phẩm mới'}
        </h5>

        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Control
                type="text"
                name="name"
                placeholder="Tên sản phẩm"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Col>

            <Col md={4}>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Điện thoại">Điện thoại</option>
                <option value="Laptop">Laptop</option>
                <option value="Máy tính bảng">Máy tính bảng</option>
                <option value="Đồng hồ thông minh">Đồng hồ thông minh</option>
                <option value="Phụ kiện">Phụ kiện</option>
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Control
                type="text"
                name="brand"
                placeholder="Hãng (Apple, Samsung...)"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </Col>

            <Col md={4}>
              <Form.Control
                type="number"
                name="price"
                placeholder="Giá bán"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Col>

            <Col md={4}>
              <Form.Control
                type="number"
                name="stock"
                placeholder="Tồn kho"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </Col>

            <Col md={4}>
              <Form.Control
                type="text"
                name="image"
                placeholder="Link hình ảnh"
                value={formData.image}
                onChange={handleChange}
                required
              />
            </Col>

            <Col md={12}>
              <Form.Control
                type="text"
                name="description"
                placeholder="Mô tả sản phẩm"
                value={formData.description}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" variant="primary">
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setFormData(initialForm);
                }}
              >
                Hủy
              </Button>
            )}
          </div>
        </Form>
      </Card>

      <Table bordered hover responsive className="bg-white">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Hãng</th>
            <th>Giá bán</th>
            <th>Kho</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((p) => (
            <tr key={p.id} className="align-middle">
              <td>{p.id}</td>
              <td>
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.brand}</td>
              <td className="text-danger fw-bold">
                {Number(p.price).toLocaleString('vi-VN')} đ
              </td>
              <td>{p.stock}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(p)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Trang trước
            </Pagination.Prev>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <Pagination.Item
                  key={page}
                  active={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              )
            )}

            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Trang sau
            </Pagination.Next>
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default ManagerProducts;
