import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  Form,
  Badge,
  Carousel,
  Pagination,
} from 'react-bootstrap';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedBrand = searchParams.get('brand') || 'All';

  useEffect(() => {
    // Tải đồng thời sản phẩm và đơn hàng thực tế
    Promise.all([
      fetch('http://localhost:9999/products').then((r) => r.json()),
      fetch('http://localhost:9999/orders').then((r) => r.json()),
    ])
      .then(([productsData, ordersData]) => {
        setProducts(productsData);
        setOrders(ordersData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải dữ liệu:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceRange, sortBy, selectedCategory, selectedBrand]);

  const handleSelectFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'All') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const brands = ['All', ...new Set(products.map((p) => p.brand))];

  // Tính số lượng bán thực tế của từng sản phẩm từ bảng orders (không hardcode)
  const salesMap = {};
  orders.forEach((order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        salesMap[item.id] = (salesMap[item.id] || 0) + (item.quantity || 1);
      });
    }
  });

  // Sản phẩm nổi bật cho Slide: lấy 5 sản phẩm mới/đầu danh sách
  const featuredProducts = products.slice(0, 5);

  // Top bán chạy nhất: tính theo số lượng đã bán thực tế từ bảng orders
  const bestSellers = [...products]
    .sort((a, b) => (salesMap[b.id] || 0) - (salesMap[a.id] || 0))
    .slice(0, 5);

  // Khuyến mãi giảm sâu: tính chênh lệch giữa originalPrice và price
  const discountProducts = [...products]
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .sort((a, b) => b.originalPrice - b.price - (a.originalPrice - a.price))
    .slice(0, 4);

  // Lọc sản phẩm
  const filteredProducts = products.filter((product) => {
    const matchName = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchBrand =
      selectedBrand === 'All' || product.brand === selectedBrand;

    const price = Number(product.price);
    let matchPrice = true;
    if (priceRange === 'under5') matchPrice = price < 5000000;
    else if (priceRange === '5to15')
      matchPrice = price >= 5000000 && price <= 15000000;
    else if (priceRange === '15to30')
      matchPrice = price > 15000000 && price <= 30000000;
    else if (priceRange === 'over30') matchPrice = price > 30000000;

    return matchName && matchCategory && matchBrand && matchPrice;
  });

  // Sắp xếp sản phẩm (Bán chạy nhất theo số lượng đơn hàng thực tế)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'bestseller') {
      return (salesMap[b.id] || 0) - (salesMap[a.id] || 0);
    }
    if (sortBy === 'price-asc') {
      return Number(a.price) - Number(b.price);
    }
    if (sortBy === 'price-desc') {
      return Number(b.price) - Number(a.price);
    }
    return 0;
  });

  // Phân trang
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Container fluid className="px-4 mb-4">
      <Row className="g-3">
        {/* CỘT TRÁI */}
        <Col lg={2} md={3}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">Danh Mục Sản Phẩm</Card.Header>
            <ListGroup variant="flush">
              {categories.map((cat) => (
                <ListGroup.Item
                  key={cat}
                  action
                  active={selectedCategory === cat}
                  onClick={() => handleSelectFilter('category', cat)}
                >
                  {cat === 'All' ? 'Tất cả danh mục' : cat}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-bold">Thương Hiệu</Card.Header>
            <Card.Body className="d-flex flex-wrap gap-1">
              {brands.map((brand) => (
                <Button
                  key={brand}
                  size="sm"
                  variant={
                    selectedBrand === brand ? 'primary' : 'outline-secondary'
                  }
                  onClick={() => handleSelectFilter('brand', brand)}
                >
                  {brand === 'All' ? 'Tất cả' : brand}
                </Button>
              ))}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="fw-bold">Cam Kết Cửa Hàng</Card.Header>
            <ListGroup variant="flush" style={{ fontSize: '13px' }}>
              <ListGroup.Item>Hàng chính hãng 100%, nguyên seal</ListGroup.Item>
              <ListGroup.Item>Bảo hành 12 - 24 tháng toàn quốc</ListGroup.Item>
              <ListGroup.Item>Lỗi 1 đổi 1 trong 30 ngày đầu</ListGroup.Item>
              <ListGroup.Item>Miễn phí giao hàng đơn từ 2 triệu</ListGroup.Item>
              <ListGroup.Item>Hỗ trợ trả góp 0% lãi suất</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* CỘT GIỮA */}
        <Col lg={7} md={9}>
          {/* SLIDE SẢN PHẨM NỔI BẬT */}
          {featuredProducts.length > 0 && (
            <Card className="mb-3">
              <Card.Header className="fw-bold">
                Sản Phẩm Nổi Bật & Mới Nhất
              </Card.Header>
              <Card.Body className="p-0">
                <Carousel variant="dark">
                  {featuredProducts.map((item) => (
                    <Carousel.Item key={item.id} className="p-4">
                      <Row className="align-items-center">
                        <Col md={5}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="d-block w-100 rounded"
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        </Col>
                        <Col md={7}>
                          <div className="mb-2 d-flex gap-1">
                            <Badge bg="secondary">{item.category}</Badge>
                            <Badge bg="info" text="dark">
                              {item.brand}
                            </Badge>
                          </div>
                          <h5>{item.name}</h5>
                          <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                            {item.description}
                          </p>
                          <div className="mb-3">
                            <span className="text-danger fw-bold fs-5 me-2">
                              {Number(item.price).toLocaleString('vi-VN')} đ
                            </span>
                            {item.originalPrice && (
                              <span className="text-muted text-decoration-line-through">
                                {Number(item.originalPrice).toLocaleString('vi-VN')} đ
                              </span>
                            )}
                          </div>
                          <Button
                            as={Link}
                            to={`/product/${item.id}`}
                            variant="primary"
                            size="sm"
                          >
                            Xem chi tiết
                          </Button>
                        </Col>
                      </Row>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </Card.Body>
            </Card>
          )}

          {/* THANH SEARCH + LỌC GIÁ + SẮP XẾP BÁN CHẠY */}
          <Card className="mb-3">
            <Card.Body>
              <Row className="g-2">
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm sản phẩm theo tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="All">Tất cả mức giá</option>
                    <option value="under5">Dưới 5 triệu</option>
                    <option value="5to15">Từ 5 - 15 triệu</option>
                    <option value="15to30">Từ 15 - 30 triệu</option>
                    <option value="over30">Trên 30 triệu</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Sắp xếp: Mặc định</option>
                    <option value="bestseller">Bán chạy nhất (theo đơn hàng)</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              Danh Sách Sản Phẩm ({sortedProducts.length})
            </h5>
            {(selectedCategory !== 'All' || selectedBrand !== 'All') && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSearchParams({})}
              >
                Xóa bộ lọc ({selectedCategory !== 'All' ? selectedCategory : ''}{' '}
                {selectedBrand !== 'All' ? selectedBrand : ''})
              </Button>
            )}
          </div>

          {/* LƯỚI SẢN PHẨM */}
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : sortedProducts.length === 0 ? (
            <p>Không tìm thấy sản phẩm phù hợp.</p>
          ) : (
            <>
              <Row className="g-3">
                {paginatedProducts.map((product) => (
                  <Col key={product.id} lg={4} sm={6}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              {/* PHÂN TRANG */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Trang trước
                    </Pagination.Prev>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <Pagination.Item
                        key={page}
                        active={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Trang sau
                    </Pagination.Next>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>

        {/* CỘT PHẢI */}
        <Col lg={3} md={12}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">Top Bán Chạy Nhất</Card.Header>
            <ListGroup variant="flush">
              {bestSellers.map((item) => {
                const soldCount = salesMap[item.id] || 0;
                return (
                  <ListGroup.Item
                    key={item.id}
                    as={Link}
                    to={`/product/${item.id}`}
                    action
                    className="d-flex gap-2 align-items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '55px', height: '55px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '13px' }}>
                        {item.name}
                      </div>
                      <div className="text-danger fw-bold" style={{ fontSize: '13px' }}>
                        {Number(item.price).toLocaleString('vi-VN')} đ
                      </div>
                      <small className="text-muted">Đã bán: {soldCount} cái</small>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-bold">Khuyến Mãi Giảm Sâu</Card.Header>
            <ListGroup variant="flush">
              {discountProducts.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  as={Link}
                  to={`/product/${item.id}`}
                  action
                  className="d-flex gap-2 align-items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '55px', height: '55px', objectFit: 'cover' }}
                  />
                  <div>
                    <div className="fw-bold" style={{ fontSize: '13px' }}>
                      {item.name}
                    </div>
                    <div className="text-danger fw-bold" style={{ fontSize: '13px' }}>
                      {Number(item.price).toLocaleString('vi-VN')} đ
                    </div>
                    <small className="text-muted text-decoration-line-through">
                      {Number(item.originalPrice).toLocaleString('vi-VN')} đ
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Card>
            <Card.Header className="fw-bold">Tổng Đài Hỗ Trợ</Card.Header>
            <Card.Body style={{ fontSize: '14px' }}>
              <p className="mb-1">
                Tư vấn mua hàng: <strong>1800 1234</strong>
              </p>
              <p className="mb-1">
                Khiếu nại, bảo hành: <strong>1800 5678</strong>
              </p>
              <p className="mb-0 text-muted">
                Thời gian: 8:00 - 22:00 hàng ngày
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
