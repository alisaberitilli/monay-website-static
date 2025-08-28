// TABLE COMPONENT COMPARISON

// 1. CURRENT ANT DESIGN IMPLEMENTATION
import { Table, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const AntTable = () => {
  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      pagination={{ pageSize: 10 }}
      className="modern-table"
    />
  );
};

// 2. SHADCN/UI IMPLEMENTATION
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ShadcnTable = () => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="hover:bg-muted/50">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">Edit</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// 3. NEXT UI IMPLEMENTATION
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
} from '@nextui-org/react';

const NextUITable = () => (
  <Table aria-label="Users table" className="min-w-full">
    <TableHeader>
      <TableColumn>USER</TableColumn>
      <TableColumn>STATUS</TableColumn>
      <TableColumn>ACTIONS</TableColumn>
    </TableHeader>
    <TableBody>
      {users.map((user) => (
        <TableRow key={user.id}>
          <TableCell>
            <User
              name={user.name}
              description={user.email}
              avatarProps={{ name: user.name.charAt(0) }}
            />
          </TableCell>
          <TableCell>
            <Chip
              color={user.status === 'active' ? 'success' : 'danger'}
              variant="flat"
            >
              {user.status}
            </Chip>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Tooltip content="Edit user">
                <Button size="sm" variant="light">Edit</Button>
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// 4. MANTINE IMPLEMENTATION
import { Table, Avatar, Badge, Group, Text, ActionIcon } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

const MantineTable = () => {
  const rows = users.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar name={user.name} color="initials" radius="xl" />
          <div>
            <Text fz="sm" fw={500}>
              {user.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {user.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={user.status === 'active' ? 'green' : 'red'} variant="light">
          {user.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray">
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red">
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>User</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};