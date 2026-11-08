import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  ListGroup,
  Button,
  Form,
  Alert,
} from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reviews từ database
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Kiểm tra xem user hiện tại đã mua sản phẩm này chưa
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  // Tải chi tiết sản phẩm
  useEffect(() => {
    fetch(`http://localhost:9999/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Tải danh sách đánh giá của sản phẩm này
  const fetchReviews = () => {
    fetch(`http://localhost:9999/reviews?productId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setReviews(sorted);
      })
      .catch((err) => console.error('Lỗi khi tải đánh giá:', err));
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Kiểm tra lịch sử mua hàng của user xem có sản phẩm này không
  useEffect(() => {
    if (!user) {
      setHasPurchased(false);
      setCheckingPurchase(false);
      return;
    }

    setCheckingPurchase(true);
    fetch(`http://localhost:9999/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((orders) => {
        // Chỉ khi đơn hàng đã được giao thành công ("delivered") mới coi là đã mua và cho phép đánh giá
        const purchased = orders.some((order) =>
          order.status === 'delivered' &&
          order.items &&
          order.items.some(
            (item) => String(item.id) === String(id)
          )
        );
        setHasPurchased(purchased);
        setCheckingPurchase(false);
      })
      .catch((err) => {
        console.error('Lỗi kiểm tra lịch sử mua hàng:', err);
        setCheckingPurchase(false);
      });
  }, [id, user]);

  const handleAddToCart = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }
    addToCart(product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  // Người dùng gửi đánh giá thật lên json-server
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để gửi đánh giá!');
      navigate('/login');
      return;
    }
    if (!hasPurchased) {
      alert('Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này!');
      return;
    }
    if (!commentInput.trim()) {
      alert('Vui lòng nhập nhận xét của bạn!');
      return;
    }

    setSubmittingReview(true);
    const newReview = {
      productId: id,
      userId: user.id,
      userName: user.name || user.username,
      rating: Number(ratingInput),
      comment: commentInput.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('http://localhost:9999/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });

      if (res.ok) {
        alert('Cảm ơn bạn đã gửi đánh giá!');
        setCommentInput('');
        setRatingInput(5);
        fetchReviews();
      } else {
        alert('Có lỗi xảy ra khi gửi đánh giá!');
      }
    } catch (error) {
      console.error(error);
      alert('Không thể kết nối đến server!');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Tính điểm đánh giá trung bình từ các review thực tế
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
        ).toFixed(1)
      : null;

  if (loading)
    return <Container className="mt-4">Đang tải chi tiết sản phẩm...</Container>;
  if (!product)
    return <Container className="mt-4">Sản phẩm không tồn tại!</Container>;

  return (
    <Container className="mt-3 mb-4">
      <div className="mb-3">
        <Button as={Link} to="/" variant="secondary" size="sm">
          Quay lại Trang chủ
        </Button>
      </div>

      <Card className="p-3 mb-4">
        <Row className="g-4">
          <Col md={5}>
            <img
              src={product.image}
              alt={product.name}
              className="img-fluid rounded border w-100"
              style={{ maxHeight: '380px', objectFit: 'cover' }}
            />
          </Col>

          <Col md={7}>
            <div className="mb-2 d-flex gap-2">
              <Badge bg="secondary">{product.category}</Badge>
              <Badge bg="info" text="dark">
                {product.brand}
              </Badge>
            </div>

            <h3>{product.name}</h3>

            <h4 className="text-danger fw-bold my-3">
              {Number(product.price).toLocaleString('vi-VN')} đ
            </h4>

            <p>
              <strong>Mô tả:</strong> {product.description || 'Sản phẩm chính hãng.'}
            </p>

            <p>
              <strong>Tồn kho:</strong> {product.stock ?? 'Còn hàng'} |{' '}
              <strong>Đánh giá thực tế:</strong>{' '}
              {averageRating ? (
                <span>
                  <strong>{averageRating}/5</strong> ({reviews.length} đánh giá từ khách hàng)
                </span>
              ) : (
                <span className="text-muted">Chưa có đánh giá nào</span>
              )}
            </p>

            {product.specs && (
              <Card className="mb-3">
                <Card.Header className="fw-bold">Thông số kỹ thuật</Card.Header>
                <ListGroup variant="flush">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <ListGroup.Item key={key}>
                      <strong>{key.toUpperCase()}:</strong> {val}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            )}

            <Button variant="primary" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KHỐI ĐÁNH GIÁ CỦA KHÁCH HÀNG */}
      <Card className="p-3">
        <h5 className="mb-3">Đánh Giá & Nhận Xét Của Khách Hàng</h5>

        {/* Form gửi đánh giá có kiểm tra điều kiện đã mua hàng */}
        {!user ? (
          <Alert variant="warning" className="small py-2">
            Vui lòng <Link to="/login">Đăng nhập</Link> để viết nhận xét và đánh giá sản phẩm.
          </Alert>
        ) : checkingPurchase ? (
          <p className="text-muted small">Đang kiểm tra lịch sử mua hàng...</p>
        ) : hasPurchased ? (
          <Card className="p-3 mb-3 bg-light border-success">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">Gửi nhận xét của bạn</h6>
              <Badge bg="success">Đã mua sản phẩm này</Badge>
            </div>
            <Form onSubmit={handleSubmitReview}>
              <Row className="g-2 mb-2 align-items-center">
                <Col md={3} sm={5}>
                  <Form.Label className="small mb-1">Điểm đánh giá:</Form.Label>
                  <Form.Select
                    size="sm"
                    value={ratingInput}
                    onChange={(e) => setRatingInput(e.target.value)}
                  >
                    <option value={5}>5 sao (Rất tốt)</option>
                    <option value={4}>4 sao (Tốt)</option>
                    <option value={3}>3 sao (Bình thường)</option>
                    <option value={2}>2 sao (Kém)</option>
                    <option value={1}>1 sao (Rất kém)</option>
                  </Form.Select>
                </Col>

                <Col md={9} sm={12}>
                  <Form.Label className="small mb-1">Ý kiến đánh giá:</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder="Viết cảm nhận của bạn về sản phẩm..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    required
                  />
                </Col>
              </Row>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submittingReview}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </Form>
          </Card>
        ) : (
          <Alert variant="info" className="small py-2">
            Bạn cần phải <strong>đặt mua và nhận hàng thành công</strong> (Đơn hàng ở trạng thái Đã giao hàng) mới có thể gửi đánh giá và nhận xét.
          </Alert>
        )}

        {/* Danh sách các đánh giá từ khách hàng đã mua */}
        {reviews.length === 0 ? (
          <p className="text-muted small mb-0">
            Sản phẩm chưa có nhận xét nào.
          </p>
        ) : (
          <ListGroup variant="flush">
            {reviews.map((r) => {
              const reviewDate = r.createdAt
                ? new Date(r.createdAt).toLocaleString('vi-VN')
                : '';

              return (
                <ListGroup.Item key={r.id} className="px-0 py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{r.userName}</strong>
                      <Badge bg="success" className="ms-2" style={{ fontSize: '11px' }}>
                        Đã mua hàng
                      </Badge>
                      <Badge bg="warning" text="dark" className="ms-2">
                        {r.rating}/5 sao
                      </Badge>
                    </div>
                    <small className="text-muted">{reviewDate}</small>
                  </div>
                  <p className="mb-0 mt-1 small text-secondary">{r.comment}</p>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        )}
      </Card>
    </Container>
  );
};

export default ProductDetail;
