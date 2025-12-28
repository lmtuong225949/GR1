-- Tạo bảng lịch sử phân công giảng dạy
-- Bảng này lưu lại lịch sử các phân công đã bị thay thế

CREATE TABLE IF NOT EXISTS lichsu_phancong (
    id SERIAL PRIMARY KEY,
    phancong_id INTEGER NOT NULL,                    -- ID của phân công gốc
    giaovienid VARCHAR(20) NOT NULL,                  -- Mã giáo viên
    lopid VARCHAR(20) NOT NULL,                      -- Mã lớp
    monid INTEGER NOT NULL,                          -- ID môn học
    namhoc_id INTEGER,                               -- ID năm học (có thể NULL)
    
    -- Thông tin hiển thị (để truy vấn dễ dàng hơn)
    tengv VARCHAR(100) NOT NULL,                     -- Tên giáo viên
    tenlop VARCHAR(50) NOT NULL,                      -- Tên lớp
    tenmon VARCHAR(100) NOT NULL,                      -- Tên môn học
    namhoc VARCHAR(50),                               -- Tên năm học
    kyhoc VARCHAR(10),                                -- Học kỳ
    
    -- Thời gian
    created_at TIMESTAMP NOT NULL,                    -- Thời gian tạo phân công gốc
    updated_at TIMESTAMP,                             -- Thời gian cập nhật cuối cùng
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian lưu vào lịch sử
    
    -- Loại hành động
    action_type VARCHAR(50) DEFAULT 'MANUAL',         -- Loại hành động: 'MANUAL', 'AUTO_ASSIGN_REPLACE', 'UPDATE', 'DELETE'
    
    -- Thông tin người thực hiện (nếu có)
    user_id INTEGER,                                  -- ID người thực hiện hành động
    user_name VARCHAR(100),                           -- Tên người thực hiện
    
    -- Ghi chú
    ghi_chu TEXT,                                     -- Ghi chú về lý do thay đổi
    
    -- Indexes để truy vấn nhanh
    CONSTRAINT fk_lichsu_phancong_giaovien 
        FOREIGN KEY (giaovienid) REFERENCES giaovien(magv) ON DELETE SET NULL,
    CONSTRAINT fk_lichsu_phancong_lop 
        FOREIGN KEY (lopid) REFERENCES lop(malop) ON DELETE SET NULL,
    CONSTRAINT fk_lichsu_phancong_monhoc 
        FOREIGN KEY (monid) REFERENCES monhoc(id) ON DELETE SET NULL,
    CONSTRAINT fk_lichsu_phancong_namhoc 
        FOREIGN KEY (namhoc_id) REFERENCES namhoc(id) ON DELETE SET NULL
);

-- Tạo indexes để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_lichsu_phancong_phancong_id ON lichsu_phancong(phancong_id);
CREATE INDEX IF NOT EXISTS idx_lichsu_phancong_giaovienid ON lichsu_phancong(giaovienid);
CREATE INDEX IF NOT EXISTS idx_lichsu_phancong_lopid ON lichsu_phancong(lopid);
CREATE INDEX IF NOT EXISTS idx_lichsu_phancong_monid ON lichsu_phancong(monid);
CREATE INDEX IF NOT EXISTS idx_lichsu_phancong_namhoc_id ON lichsu_phancong(namhoc_id);
CREATE INDEX IF NOT EXISTS idx_lichsu_phancong_archived_at ON lichsu_phancong(archived_at);
CREATE INDEX IF NOT EXISTS idx_lichsu_phancong_action_type ON lichsu_phancong(action_type);

-- Tạo trigger để tự động lưu lịch sử khi phân công bị xóa hoặc cập nhật
CREATE OR REPLACE FUNCTION save_assignment_to_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO lichsu_phancong (
            phancong_id, giaovienid, lopid, monid, namhoc_id,
            tengv, tenlop, tenmon, namhoc, kyhoc,
            created_at, updated_at, action_type
        )
        SELECT 
            OLD.id, OLD.giaovienid, OLD.lopid, OLD.monid, OLD.namhoc_id,
            gv.hoten, l.tenlop, mh.tenmon, nh.namhoc, nh.kyhoc,
            OLD.created_at, OLD.updated_at, 'DELETE'
        FROM giaovien gv, lop l, monhoc mh, namhoc nh
        WHERE gv.magv = OLD.giaovienid 
          AND l.malop = OLD.lopid 
          AND mh.id = OLD.monid 
          AND (nh.id = OLD.namhoc_id OR (OLD.namhoc_id IS NULL AND nh.id IS NULL));
        
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Chỉ lưu lịch sử nếu có thay đổi quan trọng (giáo viên, lớp, môn, năm học)
        IF (OLD.giaovienid IS DISTINCT FROM NEW.giaovienid) OR
           (OLD.lopid IS DISTINCT FROM NEW.lopid) OR
           (OLD.monid IS DISTINCT FROM NEW.monid) OR
           (OLD.namhoc_id IS DISTINCT FROM NEW.namhoc_id) THEN
            
            INSERT INTO lichsu_phancong (
                phancong_id, giaovienid, lopid, monid, namhoc_id,
                tengv, tenlop, tenmon, namhoc, kyhoc,
                created_at, updated_at, action_type
            )
            SELECT 
                OLD.id, OLD.giaovienid, OLD.lopid, OLD.monid, OLD.namhoc_id,
                gv.hoten, l.tenlop, mh.tenmon, nh.namhoc, nh.kyhoc,
                OLD.created_at, OLD.updated_at, 'UPDATE'
            FROM giaovien gv, lop l, monhoc mh, namhoc nh
            WHERE gv.magv = OLD.giaovienid 
              AND l.malop = OLD.lopid 
              AND mh.id = OLD.monid 
              AND (nh.id = OLD.namhoc_id OR (OLD.namhoc_id IS NULL AND nh.id IS NULL));
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
DROP TRIGGER IF EXISTS trigger_save_assignment_to_history ON phanconggiangday;
CREATE TRIGGER trigger_save_assignment_to_history
    AFTER DELETE OR UPDATE ON phanconggiangday
    FOR EACH ROW EXECUTE FUNCTION save_assignment_to_history();

COMMENT ON TABLE lichsu_phancong IS 'Bảng lưu lịch sử các phân công giảng dạy đã bị thay thế hoặc xóa';
COMMENT ON COLUMN lichsu_phancong.action_type IS 'Loại hành động: MANUAL (thêm thủ công), AUTO_ASSIGN_REPLACE (tự động phân công thay thế), UPDATE (cập nhật), DELETE (xóa)';
COMMENT ON COLUMN lichsu_phancong.archived_at IS 'Thời gian phân công được lưu vào lịch sử';
