import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }
    addToCart(product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <Card className="h-100">
      <Card.Img
        variant="top"
        src={product.image}
        alt={product.name}
        style={{ height: '180px', objectFit: 'cover' }}
      />
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <div className="mb-2 d-flex gap-1">
            <Badge bg="secondary">{product.category}</Badge>
            <Badge bg="info" text="dark">
              {product.brand}
            </Badge>
          </div>
          <Card.Title style={{ fontSize: '15px', fontWeight: 'bold' }}>
            {product.name}
          </Card.Title>
          <Card.Text className="text-danger fw-bold mb-2">
            {Number(product.price).toLocaleString('vi-VN')} đ
          </Card.Text>
        </div>

        <div className="d-flex gap-2 mt-2">
          <Button
            as={Link}
            to={`/product/${product.id}`}
            variant="outline-secondary"
            size="sm"
            className="w-50"
          >
            Chi tiết
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="w-50"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
